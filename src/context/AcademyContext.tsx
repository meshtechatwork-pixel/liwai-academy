import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { SAMPLE_COURSES, SAMPLE_COURSE_LEVELS, SAMPLE_LESSONS } from '../data/sampleCourses';
import { OperationType, db, handleFirestoreError, storage } from '../lib/firebase';
import {
  Certificate,
  Course,
  CourseLevel,
  CourseLevelConfig,
  Enrollment,
  Lesson,
  SavedPrompt,
  StudentProfile,
} from '../types/academy';
import { useAuth } from './AuthContext';

interface AcademyContextValue {
  courses: Course[];
  courseLevels: CourseLevelConfig[];
  enrollments: Enrollment[];
  certificates: Certificate[];
  savedPrompts: SavedPrompt[];
  loadingCourses: boolean;
  isCatalogSyncedToFirestore: boolean;
  fetchLessons: (courseId: string) => Promise<Lesson[]>;
  enrollInCourse: (course: Course) => Promise<Enrollment>;
  toggleLessonComplete: (
    course: Course,
    lessons: Lesson[],
    lessonId: string,
  ) => Promise<{ enrollment: Enrollment; certificateIssued?: Certificate }>;
  savePromptToHistory: (input: Omit<SavedPrompt, 'id' | 'userId' | 'createdAt'>) => Promise<SavedPrompt>;
  deleteSavedPrompt: (promptId: string) => Promise<void>;
  uploadFileToStorage: (file: File, folder: string) => Promise<string>;
  // Admin capabilities
  seedStarterCatalogToFirestore: () => Promise<void>;
  saveCourse: (course: Omit<Course, 'createdAt' | 'updatedAt' | 'isSeeded'>, isNew: boolean) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  saveLesson: (courseId: string, lesson: Omit<Lesson, 'createdAt' | 'updatedAt'>, isNew: boolean) => Promise<void>;
  deleteLesson: (courseId: string, lessonId: string, remainingCount: number) => Promise<void>;
  saveCourseLevel: (level: Omit<CourseLevelConfig, 'updatedAt'>) => Promise<void>;
  issueCertificateAdmin: (params: {
    userId: string;
    studentName: string;
    course: Course;
    issuedBy: string;
  }) => Promise<Certificate>;
  fetchAllStudentsAdmin: () => Promise<StudentProfile[]>;
  fetchAllEnrollmentsAdmin: () => Promise<Enrollment[]>;
  fetchAllCertificatesAdmin: () => Promise<Certificate[]>;
}

const AcademyContext = createContext<AcademyContextValue | undefined>(undefined);

const LOCAL_ENROLLMENTS_KEY = 'liwai_local_enrollments_v1';
const LOCAL_CERTIFICATES_KEY = 'liwai_local_certificates_v1';

function readLocalJson<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeLocalJson<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore storage quota errors
  }
}

export function AcademyProvider({ children }: { children: React.ReactNode }) {
  const { user, profile, authReady, isAdmin } = useAuth();
  const [firestoreCourses, setFirestoreCourses] = useState<Course[]>([]);
  const [courseLevels, setCourseLevels] = useState<CourseLevelConfig[]>(SAMPLE_COURSE_LEVELS);
  const [firestoreEnrollments, setFirestoreEnrollments] = useState<Enrollment[]>([]);
  const [localEnrollments, setLocalEnrollments] = useState<Enrollment[]>([]);
  const [firestoreCertificates, setFirestoreCertificates] = useState<Certificate[]>([]);
  const [localCertificates, setLocalCertificates] = useState<Certificate[]>([]);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const autoSeedAttemptedRef = useRef(false);

  // Public catalog listeners
  useEffect(() => {
    const unsubCourses = onSnapshot(
      collection(db, 'courses'),
      (snapshot) => {
        const list: Course[] = snapshot.docs.map((d) => ({
          ...(d.data() as Course),
          id: d.id,
          isSeeded: true,
        }));
        setFirestoreCourses(list);
        setLoadingCourses(false);
      },
      (error) => {
        setLoadingCourses(false);
        handleFirestoreError(error, OperationType.LIST, 'courses');
      },
    );

    const unsubLevels = onSnapshot(
      collection(db, 'course_levels'),
      (snapshot) => {
        if (!snapshot.empty) {
          const levels = snapshot.docs
            .map((d) => d.data() as CourseLevelConfig)
            .sort((a, b) => a.sortOrder - b.sortOrder);
          setCourseLevels(levels);
        } else {
          setCourseLevels(SAMPLE_COURSE_LEVELS);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'course_levels');
      },
    );

    return () => {
      unsubCourses();
      unsubLevels();
    };
  }, []);

  // Authenticated user-scoped listeners
  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      setFirestoreEnrollments([]);
      setFirestoreCertificates([]);
      setSavedPrompts([]);
      setLocalEnrollments([]);
      setLocalCertificates([]);
      return;
    }

    setLocalEnrollments(readLocalJson<Enrollment>(`${LOCAL_ENROLLMENTS_KEY}_${user.uid}`));
    setLocalCertificates(readLocalJson<Certificate>(`${LOCAL_CERTIFICATES_KEY}_${user.uid}`));

    const enrollQuery = query(collection(db, 'enrollments'), where('userId', '==', user.uid));
    const unsubEnroll = onSnapshot(
      enrollQuery,
      (snap) => {
        setFirestoreEnrollments(snap.docs.map((d) => d.data() as Enrollment));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'enrollments');
      },
    );

    const certQuery = query(collection(db, 'certificates'), where('userId', '==', user.uid));
    const unsubCerts = onSnapshot(
      certQuery,
      (snap) => {
        setFirestoreCertificates(snap.docs.map((d) => d.data() as Certificate));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'certificates');
      },
    );

    const promptsQuery = query(collection(db, 'saved_prompts'), where('userId', '==', user.uid));
    const unsubPrompts = onSnapshot(
      promptsQuery,
      (snap) => {
        const items = snap.docs.map((d) => d.data() as SavedPrompt);
        setSavedPrompts(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'saved_prompts');
      },
    );

    return () => {
      unsubEnroll();
      unsubCerts();
      unsubPrompts();
    };
  }, [authReady, user]);

  const seedStarterCatalogToFirestore = useCallback(async () => {
    try {
      const batch = writeBatch(db);
      for (const lvl of SAMPLE_COURSE_LEVELS) {
        batch.set(doc(db, 'course_levels', lvl.id), {
          ...lvl,
          updatedAt: serverTimestamp(),
        });
      }

      for (const course of SAMPLE_COURSES) {
        const { isSeeded: _ignored, ...courseData } = course;
        batch.set(doc(db, 'courses', course.id), {
          ...courseData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        const lessons = SAMPLE_LESSONS[course.id] || [];
        for (const lesson of lessons) {
          batch.set(doc(db, 'courses', course.id, 'lessons', lesson.id), {
            ...lesson,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      }
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'courses');
    }
  }, []);

  // Automatically initialize Firestore catalog on first Admin sign-in if empty
  useEffect(() => {
    if (authReady && isAdmin && !loadingCourses && firestoreCourses.length === 0 && !autoSeedAttemptedRef.current) {
      autoSeedAttemptedRef.current = true;
      seedStarterCatalogToFirestore().catch((err) => {
        console.warn('Auto-seed skipped:', err);
      });
    }
  }, [authReady, isAdmin, loadingCourses, firestoreCourses.length, seedStarterCatalogToFirestore]);

  const isCatalogSyncedToFirestore = firestoreCourses.length > 0;
  const courses = isCatalogSyncedToFirestore ? firestoreCourses : SAMPLE_COURSES;

  // Merge Firestore enrollments with any offline-preview local enrollments cleanly
  const enrollmentsMap = new Map<string, Enrollment>();
  for (const item of localEnrollments) enrollmentsMap.set(item.courseId, item);
  for (const item of firestoreEnrollments) enrollmentsMap.set(item.courseId, item);
  const enrollments = Array.from(enrollmentsMap.values());

  const certsMap = new Map<string, Certificate>();
  for (const item of localCertificates) certsMap.set(item.courseId, item);
  for (const item of firestoreCertificates) certsMap.set(item.courseId, item);
  const certificates = Array.from(certsMap.values());

  const fetchLessons = useCallback(async (courseId: string): Promise<Lesson[]> => {
    const courseExistsInFirestore = firestoreCourses.some((c) => c.id === courseId);
    if (!courseExistsInFirestore) {
      return SAMPLE_LESSONS[courseId] || [];
    }

    const path = `courses/${courseId}/lessons`;
    try {
      const q = query(collection(db, 'courses', courseId, 'lessons'), orderBy('order', 'asc'));
      const snap = await getDocs(q);
      if (snap.empty && SAMPLE_LESSONS[courseId]) {
        return SAMPLE_LESSONS[courseId];
      }
      return snap.docs.map((d) => ({ ...(d.data() as Lesson), id: d.id }));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path);
    }
  }, [firestoreCourses]);

  const enrollInCourse = async (course: Course): Promise<Enrollment> => {
    if (!user) throw new Error('Please sign in to enroll in courses.');

    const existing = enrollments.find((e) => e.courseId === course.id);
    if (existing) return existing;

    const enrollmentId = `${user.uid}_${course.id}`;
    const newEnrollment: Enrollment = {
      id: enrollmentId,
      userId: user.uid,
      courseId: course.id,
      courseTitle: course.title.slice(0, 140),
      courseCategory: course.category.slice(0, 60),
      level: course.level,
      completedLessonIds: [],
      progressPercent: 0,
      status: 'in_progress',
      enrolledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const courseInFirestore = firestoreCourses.some((c) => c.id === course.id);
    if (courseInFirestore) {
      try {
        await setDoc(doc(db, 'enrollments', enrollmentId), {
          ...newEnrollment,
          enrolledAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `enrollments/${enrollmentId}`);
      }
    } else {
      const next = [...localEnrollments.filter((e) => e.courseId !== course.id), newEnrollment];
      setLocalEnrollments(next);
      writeLocalJson(`${LOCAL_ENROLLMENTS_KEY}_${user.uid}`, next);
    }

    return newEnrollment;
  };

  const toggleLessonComplete = async (
    course: Course,
    lessons: Lesson[],
    lessonId: string,
  ): Promise<{ enrollment: Enrollment; certificateIssued?: Certificate }> => {
    if (!user) throw new Error('Please sign in to track your lesson progress.');

    let current = enrollments.find((e) => e.courseId === course.id);
    if (!current) {
      current = await enrollInCourse(course);
    }

    if (current.status === 'completed' && !isAdmin) {
      return { enrollment: current };
    }

    const currentIds = new Set(current.completedLessonIds || []);
    if (currentIds.has(lessonId)) {
      currentIds.delete(lessonId);
    } else {
      currentIds.add(lessonId);
    }

    const total = Math.max(lessons.length, 1);
    const completedLessonIds = Array.from(currentIds);
    const progressPercent = Math.min(100, Math.round((completedLessonIds.length / total) * 100));
    const isNowComplete = progressPercent === 100;

    const updatedEnrollment: Enrollment = {
      ...current,
      completedLessonIds,
      progressPercent,
      status: isNowComplete ? 'completed' : 'in_progress',
      updatedAt: new Date().toISOString(),
      ...(isNowComplete ? { completedAt: new Date().toISOString() } : {}),
    };

    let issuedCert: Certificate | undefined;
    const studentName = profile
      ? `${profile.firstName} ${profile.lastName}`.trim()
      : user.displayName || 'LIWAI Student';

    if (isNowComplete) {
      const certId = `${user.uid}_${course.id}`;
      const existingCert = certificates.find((c) => c.courseId === course.id);
      if (!existingCert) {
        issuedCert = {
          id: certId,
          userId: user.uid,
          studentName: studentName.slice(0, 160),
          courseId: course.id,
          courseTitle: course.title.slice(0, 140),
          courseCategory: course.category.slice(0, 60),
          level: course.level,
          certificateCode: `LIWAI-${course.id.slice(0, 4).toUpperCase()}-${user.uid.slice(0, 6).toUpperCase()}`,
          issuedBy: 'LIWAI ACADEMY',
          issuedAt: new Date().toISOString(),
        };
      }
    }

    const existingFirestoreEnrollment = firestoreEnrollments.find((e) => e.courseId === course.id);
    const courseInFirestore = firestoreCourses.some((c) => c.id === course.id);
    if (courseInFirestore) {
      try {
        const batch = writeBatch(db);
        const enrollRef = doc(db, 'enrollments', current.id);

        if (existingFirestoreEnrollment) {
          batch.update(enrollRef, {
            completedLessonIds,
            progressPercent,
            status: isNowComplete ? 'completed' : 'in_progress',
            updatedAt: serverTimestamp(),
            ...(isNowComplete ? { completedAt: serverTimestamp() } : {}),
          });
        } else {
          batch.set(enrollRef, {
            id: current.id,
            userId: user.uid,
            courseId: course.id,
            courseTitle: course.title.slice(0, 140),
            courseCategory: course.category.slice(0, 60),
            level: course.level,
            completedLessonIds,
            progressPercent,
            status: isNowComplete ? 'completed' : 'in_progress',
            enrolledAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            ...(isNowComplete ? { completedAt: serverTimestamp() } : {}),
          });
        }

        if (issuedCert) {
          batch.set(doc(db, 'certificates', issuedCert.id), {
            ...issuedCert,
            issuedAt: serverTimestamp(),
          });
        }
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `enrollments/${current.id}`);
      }
    } else {
      const nextEnroll = [
        ...localEnrollments.filter((e) => e.courseId !== course.id),
        updatedEnrollment,
      ];
      setLocalEnrollments(nextEnroll);
      writeLocalJson(`${LOCAL_ENROLLMENTS_KEY}_${user.uid}`, nextEnroll);

      if (issuedCert) {
        const nextCerts = [...localCertificates.filter((c) => c.courseId !== course.id), issuedCert];
        setLocalCertificates(nextCerts);
        writeLocalJson(`${LOCAL_CERTIFICATES_KEY}_${user.uid}`, nextCerts);
      }
    }

    return { enrollment: updatedEnrollment, certificateIssued: issuedCert };
  };

  const savePromptToHistory = async (
    input: Omit<SavedPrompt, 'id' | 'userId' | 'createdAt'>,
  ): Promise<SavedPrompt> => {
    if (!user) throw new Error('Sign in to save prompts to your library.');

    const promptId = `prompt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const record: SavedPrompt = {
      id: promptId,
      userId: user.uid,
      category: input.category.slice(0, 80),
      platform: input.platform.slice(0, 80),
      purpose: input.purpose.slice(0, 120),
      tone: input.tone.slice(0, 60),
      outputFormat: input.outputFormat.slice(0, 60),
      topic: input.topic.slice(0, 500),
      generatedPrompt: input.generatedPrompt.slice(0, 12000),
      createdAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'saved_prompts', promptId), record);
      return record;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `saved_prompts/${promptId}`);
    }
  };

  const deleteSavedPrompt = async (promptId: string) => {
    try {
      await deleteDoc(doc(db, 'saved_prompts', promptId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `saved_prompts/${promptId}`);
    }
  };

  const uploadFileToStorage = async (file: File, folder: string): Promise<string> => {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageRef = ref(storage, `${folder}/${Date.now()}_${safeName}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  // --- ADMIN ACTIONS ---
  const saveCourse = async (
    course: Omit<Course, 'createdAt' | 'updatedAt' | 'isSeeded'>,
    isNew: boolean,
  ) => {
    const path = `courses/${course.id}`;
    const existsInFirestore = firestoreCourses.some((c) => c.id === course.id);
    const shouldCreate = isNew || !existsInFirestore;
    try {
      if (shouldCreate) {
        await setDoc(doc(db, 'courses', course.id), {
          ...course,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(
          doc(db, 'courses', course.id),
          {
            ...course,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      }
    } catch (err) {
      handleFirestoreError(err, shouldCreate ? OperationType.CREATE : OperationType.UPDATE, path);
    }
  };

  const deleteCourse = async (courseId: string) => {
    const path = `courses/${courseId}`;
    try {
      await deleteDoc(doc(db, 'courses', courseId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const saveLesson = async (
    courseId: string,
    lesson: Omit<Lesson, 'createdAt' | 'updatedAt'>,
    isNew: boolean,
  ) => {
    const path = `courses/${courseId}/lessons/${lesson.id}`;
    try {
      const payload = {
        ...lesson,
        courseId,
        ...(isNew ? { createdAt: serverTimestamp() } : {}),
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'courses', courseId, 'lessons', lesson.id), payload, { merge: !isNew });

      const currentLessons = await getDocs(collection(db, 'courses', courseId, 'lessons'));
      await setDoc(
        doc(db, 'courses', courseId),
        { lessonCount: currentLessons.size, updatedAt: serverTimestamp() },
        { merge: true },
      );
    } catch (err) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
    }
  };

  const deleteLesson = async (courseId: string, lessonId: string, remainingCount: number) => {
    const path = `courses/${courseId}/lessons/${lessonId}`;
    try {
      await deleteDoc(doc(db, 'courses', courseId, 'lessons', lessonId));
      await setDoc(
        doc(db, 'courses', courseId),
        { lessonCount: Math.max(0, remainingCount), updatedAt: serverTimestamp() },
        { merge: true },
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const saveCourseLevel = async (level: Omit<CourseLevelConfig, 'updatedAt'>) => {
    const path = `course_levels/${level.id}`;
    try {
      await setDoc(doc(db, 'course_levels', level.id), {
        ...level,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const issueCertificateAdmin = async (params: {
    userId: string;
    studentName: string;
    course: Course;
    issuedBy: string;
  }): Promise<Certificate> => {
    const certId = `${params.userId}_${params.course.id}`;
    const cert: Certificate = {
      id: certId,
      userId: params.userId,
      studentName: params.studentName.slice(0, 160),
      courseId: params.course.id,
      courseTitle: params.course.title.slice(0, 140),
      courseCategory: params.course.category.slice(0, 60),
      level: params.course.level as CourseLevel,
      certificateCode: `LIWAI-${params.course.id.slice(0, 4).toUpperCase()}-${params.userId.slice(0, 6).toUpperCase()}`,
      issuedBy: params.issuedBy.slice(0, 120),
      issuedAt: serverTimestamp(),
    };
    try {
      await setDoc(doc(db, 'certificates', certId), cert);
      return cert;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `certificates/${certId}`);
    }
  };

  const fetchAllStudentsAdmin = async (): Promise<StudentProfile[]> => {
    try {
      const snap = await getDocs(collection(db, 'users'));
      return snap.docs.map((d) => d.data() as StudentProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'users');
    }
  };

  const fetchAllEnrollmentsAdmin = async (): Promise<Enrollment[]> => {
    try {
      const snap = await getDocs(collection(db, 'enrollments'));
      return snap.docs.map((d) => d.data() as Enrollment);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'enrollments');
    }
  };

  const fetchAllCertificatesAdmin = async (): Promise<Certificate[]> => {
    try {
      const snap = await getDocs(collection(db, 'certificates'));
      return snap.docs.map((d) => d.data() as Certificate);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'certificates');
    }
  };

  return (
    <AcademyContext.Provider
      value={{
        courses,
        courseLevels,
        enrollments,
        certificates,
        savedPrompts,
        loadingCourses,
        isCatalogSyncedToFirestore,
        fetchLessons,
        enrollInCourse,
        toggleLessonComplete,
        savePromptToHistory,
        deleteSavedPrompt,
        uploadFileToStorage,
        seedStarterCatalogToFirestore,
        saveCourse,
        deleteCourse,
        saveLesson,
        deleteLesson,
        saveCourseLevel,
        issueCertificateAdmin,
        fetchAllStudentsAdmin,
        fetchAllEnrollmentsAdmin,
        fetchAllCertificatesAdmin,
      }}
    >
      {children}
    </AcademyContext.Provider>
  );
}

export function useAcademy() {
  const ctx = useContext(AcademyContext);
  if (!ctx) throw new Error('useAcademy must be used inside AcademyProvider');
  return ctx;
}
