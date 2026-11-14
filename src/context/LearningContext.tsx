import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import {
  DEFAULT_SITE_CONTENT,
  SAMPLE_CATEGORIES,
  SAMPLE_COURSES,
  SAMPLE_COURSE_LEVELS,
  SAMPLE_LESSONS,
} from '../data/sampleCourses';
import { OperationType, db, handleFirestoreError, storage } from '../lib/firebase';
import {
  AppNotification,
  CategoryConfig,
  Certificate,
  CertificateVerification,
  ContactMessage,
  Course,
  CourseLevel,
  CourseLevelConfig,
  Enrollment,
  Lesson,
  ProgressRecord,
  PromptRecord,
  SiteContent,
  StudentProfile,
} from '../types/learning';
import { useAuth } from './AuthContext';

interface LearningContextValue {
  courses: Course[];
  categories: CategoryConfig[];
  courseLevels: CourseLevelConfig[];
  siteContent: SiteContent;
  enrollments: Enrollment[];
  progressList: ProgressRecord[];
  certificates: Certificate[];
  prompts: PromptRecord[];
  notifications: AppNotification[];
  loadingCourses: boolean;
  isCatalogSyncedToFirestore: boolean;
  fetchLessons: (courseId: string) => Promise<Lesson[]>;
  enrollInCourse: (course: Course) => Promise<Enrollment>;
  toggleLessonComplete: (
    course: Course,
    lessons: Lesson[],
    lessonId: string,
  ) => Promise<{ progress: ProgressRecord; certificateIssued?: Certificate }>;
  savePromptRecord: (
    input: Omit<PromptRecord, 'id' | 'userId' | 'createdAt'>,
  ) => Promise<PromptRecord>;
  togglePromptFavorite: (promptId: string, nextValue: boolean) => Promise<void>;
  deletePromptRecord: (promptId: string) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  verifyCertificateCode: (code: string) => Promise<CertificateVerification | null>;
  submitContactMessage: (input: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => Promise<void>;
  uploadFileToStorage: (file: File, folder: string) => Promise<string>;
  // Admin capabilities
  seedStarterCatalogToFirestore: () => Promise<void>;
  saveCourse: (course: Omit<Course, 'createdAt' | 'updatedAt' | 'isSeeded'>, isNew: boolean) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  saveLesson: (lesson: Omit<Lesson, 'createdAt' | 'updatedAt'>, isNew: boolean) => Promise<void>;
  deleteLesson: (courseId: string, lessonId: string, remainingCount: number) => Promise<void>;
  saveCategory: (category: Omit<CategoryConfig, 'updatedAt'>) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  saveCourseLevel: (level: Omit<CourseLevelConfig, 'updatedAt'>) => Promise<void>;
  saveSiteContent: (content: Omit<SiteContent, 'updatedAt'>) => Promise<void>;
  issueCertificateAdmin: (params: {
    userId: string;
    studentName: string;
    course: Course;
    issuedBy: string;
  }) => Promise<Certificate>;
  fetchAllStudentsAdmin: () => Promise<StudentProfile[]>;
  fetchAllEnrollmentsAdmin: () => Promise<Enrollment[]>;
  fetchAllProgressAdmin: () => Promise<ProgressRecord[]>;
  fetchAllCertificatesAdmin: () => Promise<Certificate[]>;
  fetchContactMessagesAdmin: () => Promise<ContactMessage[]>;
  resolveContactMessageAdmin: (messageId: string) => Promise<void>;
}

const LearningContext = createContext<LearningContextValue | undefined>(undefined);

const LOCAL_ENROLLMENTS_KEY = 'learnitwithai_enrollments_v1';
const LOCAL_PROGRESS_KEY = 'learnitwithai_progress_v1';
const LOCAL_CERTIFICATES_KEY = 'learnitwithai_certificates_v1';

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

export function LearningProvider({ children }: { children: React.ReactNode }) {
  const { user, profile, authReady, isAdmin } = useAuth();
  const [firestoreCourses, setFirestoreCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CategoryConfig[]>(SAMPLE_CATEGORIES);
  const [courseLevels, setCourseLevels] = useState<CourseLevelConfig[]>(SAMPLE_COURSE_LEVELS);
  const [siteContent, setSiteContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);

  const [firestoreEnrollments, setFirestoreEnrollments] = useState<Enrollment[]>([]);
  const [localEnrollments, setLocalEnrollments] = useState<Enrollment[]>([]);
  const [firestoreProgress, setFirestoreProgress] = useState<ProgressRecord[]>([]);
  const [localProgress, setLocalProgress] = useState<ProgressRecord[]>([]);
  const [firestoreCertificates, setFirestoreCertificates] = useState<Certificate[]>([]);
  const [localCertificates, setLocalCertificates] = useState<Certificate[]>([]);
  const [prompts, setPrompts] = useState<PromptRecord[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const [loadingCourses, setLoadingCourses] = useState(true);
  const autoSeedAttemptedRef = useRef(false);

  // Public catalog, categories, levels, and site content listeners
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

    const unsubCategories = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs
            .map((d) => d.data() as CategoryConfig)
            .sort((a, b) => a.sortOrder - b.sortOrder);
          setCategories(list);
        } else {
          setCategories(SAMPLE_CATEGORIES);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'categories');
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

    const unsubSiteContent = onSnapshot(
      doc(db, 'site_content', 'main'),
      (snapshot) => {
        if (snapshot.exists()) {
          setSiteContent(snapshot.data() as SiteContent);
        } else {
          setSiteContent(DEFAULT_SITE_CONTENT);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'site_content/main');
      },
    );

    return () => {
      unsubCourses();
      unsubCategories();
      unsubLevels();
      unsubSiteContent();
    };
  }, []);

  // Authenticated user-scoped listeners
  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      setFirestoreEnrollments([]);
      setFirestoreProgress([]);
      setFirestoreCertificates([]);
      setPrompts([]);
      setNotifications([]);
      setLocalEnrollments([]);
      setLocalProgress([]);
      setLocalCertificates([]);
      return;
    }

    setLocalEnrollments(readLocalJson<Enrollment>(`${LOCAL_ENROLLMENTS_KEY}_${user.uid}`));
    setLocalProgress(readLocalJson<ProgressRecord>(`${LOCAL_PROGRESS_KEY}_${user.uid}`));
    setLocalCertificates(readLocalJson<Certificate>(`${LOCAL_CERTIFICATES_KEY}_${user.uid}`));

    const unsubEnroll = onSnapshot(
      query(collection(db, 'enrollments'), where('userId', '==', user.uid)),
      (snap) => setFirestoreEnrollments(snap.docs.map((d) => d.data() as Enrollment)),
      (error) => handleFirestoreError(error, OperationType.LIST, 'enrollments'),
    );

    const unsubProgress = onSnapshot(
      query(collection(db, 'progress'), where('userId', '==', user.uid)),
      (snap) => setFirestoreProgress(snap.docs.map((d) => d.data() as ProgressRecord)),
      (error) => handleFirestoreError(error, OperationType.LIST, 'progress'),
    );

    const unsubCerts = onSnapshot(
      query(collection(db, 'certificates'), where('userId', '==', user.uid)),
      (snap) => setFirestoreCertificates(snap.docs.map((d) => d.data() as Certificate)),
      (error) => handleFirestoreError(error, OperationType.LIST, 'certificates'),
    );

    const unsubPrompts = onSnapshot(
      query(collection(db, 'prompts'), where('userId', '==', user.uid)),
      (snap) => setPrompts(snap.docs.map((d) => d.data() as PromptRecord)),
      (error) => handleFirestoreError(error, OperationType.LIST, 'prompts'),
    );

    const unsubNotifications = onSnapshot(
      query(collection(db, 'notifications'), where('userId', '==', user.uid)),
      (snap) => setNotifications(snap.docs.map((d) => d.data() as AppNotification)),
      (error) => handleFirestoreError(error, OperationType.LIST, 'notifications'),
    );

    return () => {
      unsubEnroll();
      unsubProgress();
      unsubCerts();
      unsubPrompts();
      unsubNotifications();
    };
  }, [authReady, user]);

  const seedStarterCatalogToFirestore = useCallback(async () => {
    try {
      const batch = writeBatch(db);
      for (const cat of SAMPLE_CATEGORIES) {
        batch.set(doc(db, 'categories', cat.id), {
          ...cat,
          updatedAt: serverTimestamp(),
        });
      }
      for (const lvl of SAMPLE_COURSE_LEVELS) {
        batch.set(doc(db, 'course_levels', lvl.id), {
          ...lvl,
          updatedAt: serverTimestamp(),
        });
      }
      batch.set(doc(db, 'site_content', 'main'), {
        ...DEFAULT_SITE_CONTENT,
        updatedAt: serverTimestamp(),
      });

      for (const course of SAMPLE_COURSES) {
        const { isSeeded: _ignored, ...courseData } = course;
        batch.set(doc(db, 'courses', course.id), {
          ...courseData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      for (const lesson of SAMPLE_LESSONS) {
        batch.set(doc(db, 'lessons', lesson.id), {
          ...lesson,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'courses');
    }
  }, []);

  useEffect(() => {
    if (
      authReady &&
      isAdmin &&
      !loadingCourses &&
      firestoreCourses.length === 0 &&
      !autoSeedAttemptedRef.current
    ) {
      autoSeedAttemptedRef.current = true;
      seedStarterCatalogToFirestore().catch((err) => {
        console.warn('Auto-seed skipped:', err);
      });
    }
  }, [authReady, isAdmin, loadingCourses, firestoreCourses.length, seedStarterCatalogToFirestore]);

  const isCatalogSyncedToFirestore = firestoreCourses.length > 0;
  const courses = isCatalogSyncedToFirestore ? firestoreCourses : SAMPLE_COURSES;

  const enrollMap = new Map<string, Enrollment>();
  for (const e of localEnrollments) enrollMap.set(e.courseId, e);
  for (const e of firestoreEnrollments) enrollMap.set(e.courseId, e);
  const enrollments = Array.from(enrollMap.values());

  const progMap = new Map<string, ProgressRecord>();
  for (const p of localProgress) progMap.set(p.courseId, p);
  for (const p of firestoreProgress) progMap.set(p.courseId, p);
  const progressList = Array.from(progMap.values());

  const certMap = new Map<string, Certificate>();
  for (const c of localCertificates) certMap.set(c.courseId, c);
  for (const c of firestoreCertificates) certMap.set(c.courseId, c);
  const certificates = Array.from(certMap.values());

  const fetchLessons = useCallback(
    async (courseId: string): Promise<Lesson[]> => {
      const courseInFirestore = firestoreCourses.some((c) => c.id === courseId);
      if (!courseInFirestore) {
        return SAMPLE_LESSONS.filter((l) => l.courseId === courseId).sort(
          (a, b) => a.order - b.order,
        );
      }

      try {
        const q = query(collection(db, 'lessons'), where('courseId', '==', courseId));
        const snap = await getDocs(q);
        if (snap.empty) {
          return SAMPLE_LESSONS.filter((l) => l.courseId === courseId).sort(
            (a, b) => a.order - b.order,
          );
        }
        return snap.docs
          .map((d) => ({ ...(d.data() as Lesson), id: d.id }))
          .sort((a, b) => a.order - b.order);
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'lessons');
      }
    },
    [firestoreCourses],
  );

  const enrollInCourse = async (course: Course): Promise<Enrollment> => {
    if (!user) throw new Error('Please sign in to enroll in courses.');

    const existing = enrollments.find((e) => e.courseId === course.id);
    if (existing) return existing;

    const compositeId = `${user.uid}_${course.id}`;
    const newEnrollment: Enrollment = {
      id: compositeId,
      userId: user.uid,
      courseId: course.id,
      courseTitle: course.title.slice(0, 140),
      courseCategory: course.category.slice(0, 80),
      level: course.level,
      status: 'in_progress',
      enrolledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newProgress: ProgressRecord = {
      id: compositeId,
      userId: user.uid,
      courseId: course.id,
      completedLessonIds: [],
      lastLessonId: '',
      progressPercent: 0,
      status: 'in_progress',
      updatedAt: new Date().toISOString(),
    };

    const courseInFirestore = firestoreCourses.some((c) => c.id === course.id);
    if (courseInFirestore) {
      try {
        const batch = writeBatch(db);
        batch.set(doc(db, 'enrollments', compositeId), {
          ...newEnrollment,
          enrolledAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        batch.set(doc(db, 'progress', compositeId), {
          ...newProgress,
          updatedAt: serverTimestamp(),
        });
        const notifId = `enroll_${compositeId}`;
        batch.set(doc(db, 'notifications', notifId), {
          id: notifId,
          userId: user.uid,
          title: 'Course Enrolled',
          message: `You are now enrolled in ${course.title}.`,
          type: 'success',
          isRead: false,
          link: `/courses/${course.id}`,
          createdAt: serverTimestamp(),
        });
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `enrollments/${compositeId}`);
      }
    } else {
      const nextEnroll = [...localEnrollments.filter((e) => e.courseId !== course.id), newEnrollment];
      const nextProg = [...localProgress.filter((p) => p.courseId !== course.id), newProgress];
      setLocalEnrollments(nextEnroll);
      setLocalProgress(nextProg);
      writeLocalJson(`${LOCAL_ENROLLMENTS_KEY}_${user.uid}`, nextEnroll);
      writeLocalJson(`${LOCAL_PROGRESS_KEY}_${user.uid}`, nextProg);
    }

    return newEnrollment;
  };

  const toggleLessonComplete = async (
    course: Course,
    lessons: Lesson[],
    lessonId: string,
  ): Promise<{ progress: ProgressRecord; certificateIssued?: Certificate }> => {
    if (!user) throw new Error('Please sign in to track your lesson progress.');

    let currentEnroll = enrollments.find((e) => e.courseId === course.id);
    if (!currentEnroll) {
      currentEnroll = await enrollInCourse(course);
    }

    const compositeId = `${user.uid}_${course.id}`;
    const currentProg = progressList.find((p) => p.courseId === course.id) || {
      id: compositeId,
      userId: user.uid,
      courseId: course.id,
      completedLessonIds: [],
      lastLessonId: '',
      progressPercent: 0,
      status: 'in_progress' as const,
      updatedAt: new Date().toISOString(),
    };

    if (currentProg.status === 'completed' && !isAdmin) {
      return { progress: currentProg };
    }

    const currentIds = new Set(currentProg.completedLessonIds || []);
    if (currentIds.has(lessonId)) {
      currentIds.delete(lessonId);
    } else {
      currentIds.add(lessonId);
    }

    const total = Math.max(lessons.length, 1);
    const completedLessonIds = Array.from(currentIds);
    const progressPercent = Math.min(100, Math.round((completedLessonIds.length / total) * 100));
    const isNowComplete = progressPercent === 100;

    const updatedProgress: ProgressRecord = {
      ...currentProg,
      completedLessonIds,
      lastLessonId: lessonId,
      progressPercent,
      status: isNowComplete ? 'completed' : 'in_progress',
      updatedAt: new Date().toISOString(),
      ...(isNowComplete ? { completedAt: new Date().toISOString() } : {}),
    };

    let issuedCert: Certificate | undefined;
    const studentName = profile
      ? `${profile.firstName} ${profile.lastName}`.trim()
      : user.displayName || 'Learn It With AI Student';

    if (isNowComplete && !certificates.some((c) => c.courseId === course.id)) {
      const code = `LWAI-${course.id.slice(0, 4).toUpperCase()}-${user.uid.slice(0, 6).toUpperCase()}`;
      issuedCert = {
        id: compositeId,
        userId: user.uid,
        studentName: studentName.slice(0, 160),
        courseId: course.id,
        courseTitle: course.title.slice(0, 140),
        courseCategory: course.category.slice(0, 80),
        level: course.level,
        certificateCode: code,
        issuedBy: 'Learn It With AI',
        issuedAt: new Date().toISOString(),
      };
    }

    const courseInFirestore = firestoreCourses.some((c) => c.id === course.id);
    const existingProgInFirestore = firestoreProgress.some((p) => p.courseId === course.id);
    const existingEnrollInFirestore = firestoreEnrollments.some((e) => e.courseId === course.id);

    if (courseInFirestore) {
      try {
        const batch = writeBatch(db);
        const progRef = doc(db, 'progress', compositeId);
        if (existingProgInFirestore) {
          batch.update(progRef, {
            completedLessonIds,
            lastLessonId: lessonId,
            progressPercent,
            status: isNowComplete ? 'completed' : 'in_progress',
            updatedAt: serverTimestamp(),
            ...(isNowComplete ? { completedAt: serverTimestamp() } : {}),
          });
        } else {
          batch.set(progRef, {
            id: compositeId,
            userId: user.uid,
            courseId: course.id,
            completedLessonIds,
            lastLessonId: lessonId,
            progressPercent,
            status: isNowComplete ? 'completed' : 'in_progress',
            updatedAt: serverTimestamp(),
            ...(isNowComplete ? { completedAt: serverTimestamp() } : {}),
          });
        }

        const enrollRef = doc(db, 'enrollments', compositeId);
        if (existingEnrollInFirestore) {
          if (isNowComplete) {
            batch.update(enrollRef, {
              status: 'completed',
              updatedAt: serverTimestamp(),
            });
          }
        } else {
          batch.set(enrollRef, {
            id: compositeId,
            userId: user.uid,
            courseId: course.id,
            courseTitle: course.title.slice(0, 140),
            courseCategory: course.category.slice(0, 80),
            level: course.level,
            status: isNowComplete ? 'completed' : 'in_progress',
            enrolledAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        if (issuedCert) {
          batch.set(doc(db, 'certificates', issuedCert.id), {
            ...issuedCert,
            issuedAt: serverTimestamp(),
          });
          batch.set(doc(db, 'certificate_verifications', issuedCert.certificateCode), {
            certificateCode: issuedCert.certificateCode,
            courseId: issuedCert.courseId,
            studentName: issuedCert.studentName,
            courseTitle: issuedCert.courseTitle,
            courseCategory: issuedCert.courseCategory,
            level: issuedCert.level,
            issuedBy: issuedCert.issuedBy,
            valid: true,
            issuedAt: serverTimestamp(),
          });
          const certNotifId = `cert_${compositeId}`;
          batch.set(doc(db, 'notifications', certNotifId), {
            id: certNotifId,
            userId: user.uid,
            title: 'Certificate Earned',
            message: `Congratulations! Your certificate for ${course.title} (${issuedCert.certificateCode}) is ready.`,
            type: 'certificate',
            isRead: false,
            link: '/certificates',
            createdAt: serverTimestamp(),
          });
        }

        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `progress/${compositeId}`);
      }
    } else {
      const nextProg = [...localProgress.filter((p) => p.courseId !== course.id), updatedProgress];
      setLocalProgress(nextProg);
      writeLocalJson(`${LOCAL_PROGRESS_KEY}_${user.uid}`, nextProg);

      if (isNowComplete) {
        const nextEnroll = localEnrollments.map((e) =>
          e.courseId === course.id ? { ...e, status: 'completed' as const } : e,
        );
        setLocalEnrollments(nextEnroll);
        writeLocalJson(`${LOCAL_ENROLLMENTS_KEY}_${user.uid}`, nextEnroll);
      }

      if (issuedCert) {
        const nextCerts = [...localCertificates.filter((c) => c.courseId !== course.id), issuedCert];
        setLocalCertificates(nextCerts);
        writeLocalJson(`${LOCAL_CERTIFICATES_KEY}_${user.uid}`, nextCerts);
      }
    }

    return { progress: updatedProgress, certificateIssued: issuedCert };
  };

  const savePromptRecord = async (
    input: Omit<PromptRecord, 'id' | 'userId' | 'createdAt'>,
  ): Promise<PromptRecord> => {
    if (!user) throw new Error('Sign in to save prompt history.');
    const promptId = `prompt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const record: PromptRecord = {
      id: promptId,
      userId: user.uid,
      title: input.title.slice(0, 160),
      platform: input.platform.slice(0, 80),
      category: input.category.slice(0, 80),
      purpose: input.purpose.slice(0, 140),
      tone: input.tone.slice(0, 60),
      outputFormat: input.outputFormat.slice(0, 80),
      detailLevel: input.detailLevel.slice(0, 60),
      topic: input.topic.slice(0, 600),
      generatedPrompt: input.generatedPrompt.slice(0, 12000),
      isFavorite: Boolean(input.isFavorite),
      createdAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'prompts', promptId), record);
      return record;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `prompts/${promptId}`);
    }
  };

  const togglePromptFavorite = async (promptId: string, nextValue: boolean) => {
    try {
      await updateDoc(doc(db, 'prompts', promptId), { isFavorite: nextValue });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `prompts/${promptId}`);
    }
  };

  const deletePromptRecord = async (promptId: string) => {
    try {
      await deleteDoc(doc(db, 'prompts', promptId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `prompts/${promptId}`);
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { isRead: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `notifications/${notificationId}`);
    }
  };

  const verifyCertificateCode = async (code: string): Promise<CertificateVerification | null> => {
    const clean = code.trim().toUpperCase();
    if (!clean) return null;

    // Check local certs first if preview mode
    const localMatch = certificates.find((c) => c.certificateCode.toUpperCase() === clean);
    try {
      const snap = await getDoc(doc(db, 'certificate_verifications', clean));
      if (snap.exists()) {
        return snap.data() as CertificateVerification;
      }
    } catch (err) {
      console.warn('Certificate verification lookup error:', err);
    }

    if (localMatch) {
      return {
        certificateCode: localMatch.certificateCode,
        courseId: localMatch.courseId,
        studentName: localMatch.studentName,
        courseTitle: localMatch.courseTitle,
        courseCategory: localMatch.courseCategory,
        level: localMatch.level,
        issuedBy: localMatch.issuedBy,
        valid: true,
        issuedAt: localMatch.issuedAt,
      };
    }

    return null;
  };

  const submitContactMessage = async (input: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => {
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    try {
      await setDoc(doc(db, 'contact_messages', msgId), {
        id: msgId,
        name: input.name.trim().slice(0, 120),
        email: input.email.trim().slice(0, 160),
        subject: input.subject.trim().slice(0, 160),
        message: input.message.trim().slice(0, 3000),
        status: 'new',
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `contact_messages/${msgId}`);
    }
  };

  const uploadFileToStorage = async (file: File, folder: string): Promise<string> => {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageRef = ref(storage, `${folder}/${Date.now()}_${safeName}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  // --- ADMIN OPERATIONS ---
  const saveCourse = async (
    course: Omit<Course, 'createdAt' | 'updatedAt' | 'isSeeded'>,
    isNew: boolean,
  ) => {
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
      handleFirestoreError(
        err,
        shouldCreate ? OperationType.CREATE : OperationType.UPDATE,
        `courses/${course.id}`,
      );
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      await deleteDoc(doc(db, 'courses', courseId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `courses/${courseId}`);
    }
  };

  const saveLesson = async (
    lesson: Omit<Lesson, 'createdAt' | 'updatedAt'>,
    isNew: boolean,
  ) => {
    const path = `lessons/${lesson.id}`;
    try {
      if (isNew) {
        await setDoc(doc(db, 'lessons', lesson.id), {
          ...lesson,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(
          doc(db, 'lessons', lesson.id),
          {
            ...lesson,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      }

      const snap = await getDocs(
        query(collection(db, 'lessons'), where('courseId', '==', lesson.courseId)),
      );
      await setDoc(
        doc(db, 'courses', lesson.courseId),
        { lessonCount: snap.size, updatedAt: serverTimestamp() },
        { merge: true },
      );
    } catch (err) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, path);
    }
  };

  const deleteLesson = async (courseId: string, lessonId: string, remainingCount: number) => {
    try {
      await deleteDoc(doc(db, 'lessons', lessonId));
      await setDoc(
        doc(db, 'courses', courseId),
        { lessonCount: Math.max(0, remainingCount), updatedAt: serverTimestamp() },
        { merge: true },
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `lessons/${lessonId}`);
    }
  };

  const saveCategory = async (category: Omit<CategoryConfig, 'updatedAt'>) => {
    try {
      await setDoc(doc(db, 'categories', category.id), {
        ...category,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `categories/${category.id}`);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${categoryId}`);
    }
  };

  const saveCourseLevel = async (level: Omit<CourseLevelConfig, 'updatedAt'>) => {
    try {
      await setDoc(doc(db, 'course_levels', level.id), {
        ...level,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `course_levels/${level.id}`);
    }
  };

  const saveSiteContent = async (content: Omit<SiteContent, 'updatedAt'>) => {
    try {
      await setDoc(doc(db, 'site_content', content.id), {
        ...content,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `site_content/${content.id}`);
    }
  };

  const issueCertificateAdmin = async (params: {
    userId: string;
    studentName: string;
    course: Course;
    issuedBy: string;
  }): Promise<Certificate> => {
    const certId = `${params.userId}_${params.course.id}`;
    const code = `LWAI-${params.course.id.slice(0, 4).toUpperCase()}-${params.userId.slice(0, 6).toUpperCase()}`;
    const cert: Certificate = {
      id: certId,
      userId: params.userId,
      studentName: params.studentName.slice(0, 160),
      courseId: params.course.id,
      courseTitle: params.course.title.slice(0, 140),
      courseCategory: params.course.category.slice(0, 80),
      level: params.course.level as CourseLevel,
      certificateCode: code,
      issuedBy: params.issuedBy.slice(0, 120),
      issuedAt: serverTimestamp(),
    };

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'certificates', certId), cert);
      batch.set(doc(db, 'certificate_verifications', code), {
        certificateCode: code,
        courseId: params.course.id,
        studentName: cert.studentName,
        courseTitle: cert.courseTitle,
        courseCategory: cert.courseCategory,
        level: cert.level,
        issuedBy: cert.issuedBy,
        valid: true,
        issuedAt: serverTimestamp(),
      });
      const notifId = `cert_${certId}`;
      batch.set(doc(db, 'notifications', notifId), {
        id: notifId,
        userId: params.userId,
        title: 'Certificate Issued',
        message: `Your Learn It With AI certificate for ${params.course.title} (${code}) is ready.`,
        type: 'certificate',
        isRead: false,
        link: '/certificates',
        createdAt: serverTimestamp(),
      });
      await batch.commit();
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

  const fetchAllProgressAdmin = async (): Promise<ProgressRecord[]> => {
    try {
      const snap = await getDocs(collection(db, 'progress'));
      return snap.docs.map((d) => d.data() as ProgressRecord);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'progress');
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

  const fetchContactMessagesAdmin = async (): Promise<ContactMessage[]> => {
    try {
      const snap = await getDocs(
        query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc')),
      );
      return snap.docs.map((d) => d.data() as ContactMessage);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'contact_messages');
    }
  };

  const resolveContactMessageAdmin = async (messageId: string) => {
    try {
      await updateDoc(doc(db, 'contact_messages', messageId), { status: 'resolved' });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `contact_messages/${messageId}`);
    }
  };

  return (
    <LearningContext.Provider
      value={{
        courses,
        categories,
        courseLevels,
        siteContent,
        enrollments,
        progressList,
        certificates,
        prompts,
        notifications,
        loadingCourses,
        isCatalogSyncedToFirestore,
        fetchLessons,
        enrollInCourse,
        toggleLessonComplete,
        savePromptRecord,
        togglePromptFavorite,
        deletePromptRecord,
        markNotificationRead,
        verifyCertificateCode,
        submitContactMessage,
        uploadFileToStorage,
        seedStarterCatalogToFirestore,
        saveCourse,
        deleteCourse,
        saveLesson,
        deleteLesson,
        saveCategory,
        deleteCategory,
        saveCourseLevel,
        saveSiteContent,
        issueCertificateAdmin,
        fetchAllStudentsAdmin,
        fetchAllEnrollmentsAdmin,
        fetchAllProgressAdmin,
        fetchAllCertificatesAdmin,
        fetchContactMessagesAdmin,
        resolveContactMessageAdmin,
      }}
    >
      {children}
    </LearningContext.Provider>
  );
}

export function useLearningContext() {
  const ctx = useContext(LearningContext);
  if (!ctx) throw new Error('useLearningContext must be used inside LearningProvider');
  return ctx;
}
