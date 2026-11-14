import React, { useEffect, useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Layers,
  Mail,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CATEGORY_IMAGES } from '../data/sampleCourses';
import { useLearning } from '../hooks/useLearning';
import {
  COURSE_LEVELS,
  CategoryConfig,
  Certificate,
  ContactMessage,
  Course,
  CourseCategory,
  CourseLevel,
  CourseLevelConfig,
  Enrollment,
  Lesson,
  ProgressRecord,
  SiteContent,
  StudentProfile,
} from '../types/learning';

type AdminTab =
  | 'overview'
  | 'courses'
  | 'lessons'
  | 'students'
  | 'categories'
  | 'levels'
  | 'certificates'
  | 'content';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const {
    courses,
    categories,
    courseLevels,
    siteContent,
    isCatalogSyncedToFirestore,
    seedStarterCatalogToFirestore,
    saveCourse,
    deleteCourse,
    fetchLessons,
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
    uploadFileToStorage,
  } = useLearning();

  const [tab, setTab] = useState<AdminTab>('overview');
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [allEnrollments, setAllEnrollments] = useState<Enrollment[]>([]);
  const [allProgress, setAllProgress] = useState<ProgressRecord[]>([]);
  const [allCertificates, setAllCertificates] = useState<Certificate[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [loadingAdminData, setLoadingAdminData] = useState(false);

  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Student Search & Filter
  const [studentQuery, setStudentQuery] = useState('');
  const [studentLevelFilter, setStudentLevelFilter] = useState<string>('All');

  // Course Editor State
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseCategory, setCourseCategory] = useState<CourseCategory>('Web Design');
  const [courseLevel, setCourseLevel] = useState<CourseLevel>('Beginner');
  const [courseInstructor, setCourseInstructor] = useState('');
  const [courseInstructorBio, setCourseInstructorBio] = useState('');
  const [courseDuration, setCourseDuration] = useState('4h 30m');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseThumbnailUrl, setCourseThumbnailUrl] = useState('');
  const [coursePublished, setCoursePublished] = useState(true);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  // Lesson Editor State
  const [lessonCourseId, setLessonCourseId] = useState<string>(courses[0]?.id || '');
  const [courseLessons, setCourseLessons] = useState<Lesson[]>([]);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonOrder, setLessonOrder] = useState(1);
  const [lessonDuration, setLessonDuration] = useState('20 min');
  const [lessonSummary, setLessonSummary] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonResourceTitle, setLessonResourceTitle] = useState('');
  const [lessonResourceUrl, setLessonResourceUrl] = useState('');
  const [lessonResourceContent, setLessonResourceContent] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingResource, setUploadingResource] = useState(false);

  // Category Editor State
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catOrder, setCatOrder] = useState(categories.length + 1);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  // Level Editor State
  const [levelEdits, setLevelEdits] = useState<CourseLevelConfig[]>(courseLevels);

  // Issue Certificate State
  const [certStudentUid, setCertStudentUid] = useState('');
  const [certCourseId, setCertCourseId] = useState(courses[0]?.id || '');

  // Website Content Editor State
  const [contentForm, setContentForm] = useState<Omit<SiteContent, 'updatedAt'>>(siteContent);

  const loadAdminRecords = async () => {
    setLoadingAdminData(true);
    try {
      const [s, e, p, c, m] = await Promise.all([
        fetchAllStudentsAdmin(),
        fetchAllEnrollmentsAdmin(),
        fetchAllProgressAdmin(),
        fetchAllCertificatesAdmin(),
        fetchContactMessagesAdmin(),
      ]);
      setStudents(s);
      setAllEnrollments(e);
      setAllProgress(p);
      setAllCertificates(c);
      setContactMessages(m);
      if (s.length > 0 && !certStudentUid) setCertStudentUid(s[0].uid);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load admin metrics.');
    } finally {
      setLoadingAdminData(false);
    }
  };

  useEffect(() => {
    loadAdminRecords();
  }, []);

  useEffect(() => {
    setLevelEdits(courseLevels);
  }, [courseLevels]);

  useEffect(() => {
    setContentForm(siteContent);
  }, [siteContent]);

  useEffect(() => {
    if (!lessonCourseId && courses[0]?.id) setLessonCourseId(courses[0].id);
    if (!certCourseId && courses[0]?.id) setCertCourseId(courses[0].id);
  }, [courses, lessonCourseId, certCourseId]);

  useEffect(() => {
    if (!lessonCourseId) return;
    fetchLessons(lessonCourseId).then((list) => {
      const sorted = [...list].sort((a, b) => a.order - b.order);
      setCourseLessons(sorted);
      setLessonOrder(sorted.length + 1);
    });
  }, [lessonCourseId, fetchLessons]);

  const resetCourseForm = () => {
    setEditingCourseId(null);
    setCourseTitle('');
    setCourseCategory(categories[0]?.name || 'Web Design');
    setCourseLevel('Beginner');
    setCourseInstructor('');
    setCourseInstructorBio('');
    setCourseDuration('4h 30m');
    setCourseDescription('');
    setCourseThumbnailUrl('');
    setCoursePublished(true);
  };

  const handleEditCourse = (c: Course) => {
    setEditingCourseId(c.id);
    setCourseTitle(c.title);
    setCourseCategory(c.category);
    setCourseLevel(c.level);
    setCourseInstructor(c.instructor);
    setCourseInstructorBio(c.instructorBio || '');
    setCourseDuration(c.duration);
    setCourseDescription(c.description);
    setCourseThumbnailUrl(c.thumbnailUrl);
    setCoursePublished(c.published);
    setTab('courses');
  };

  const handleUploadThumbnail = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumb(true);
    setError(null);
    try {
      const url = await uploadFileToStorage(file, 'course_thumbnails');
      setCourseThumbnailUrl(url);
      setNotice('Thumbnail uploaded to Firebase Storage.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Thumbnail upload failed.');
    } finally {
      setUploadingThumb(false);
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const slugId =
      editingCourseId ||
      courseTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 60) +
        '-' +
        Date.now().toString().slice(-4);

    const existingCourse = courses.find((c) => c.id === editingCourseId);

    try {
      await saveCourse(
        {
          id: slugId,
          title: courseTitle.trim().slice(0, 140),
          category: courseCategory,
          level: courseLevel,
          description: courseDescription.trim().slice(0, 2000),
          instructor: courseInstructor.trim().slice(0, 100),
          ...(courseInstructorBio.trim()
            ? { instructorBio: courseInstructorBio.trim().slice(0, 300) }
            : {}),
          duration: courseDuration.trim().slice(0, 40),
          thumbnailUrl: (
            courseThumbnailUrl.trim() ||
            CATEGORY_IMAGES[courseCategory] ||
            CATEGORY_IMAGES['Web Design']
          ).slice(0, 1000),
          lessonCount: existingCourse?.lessonCount ?? 0,
          published: coursePublished,
        },
        !editingCourseId,
      );
      setNotice(editingCourseId ? 'Course updated.' : 'Course created in Firestore.');
      resetCourseForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save course.');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    setError(null);
    try {
      await deleteCourse(id);
      setNotice('Course deleted.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete course.');
    }
  };

  const handleUploadLessonVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    setError(null);
    try {
      const url = await uploadFileToStorage(file, `lesson_videos/${lessonCourseId}`);
      setLessonVideoUrl(url);
      setNotice('Video uploaded to Firebase Storage.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Video upload failed.');
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleUploadLessonResource = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResource(true);
    setError(null);
    try {
      const url = await uploadFileToStorage(file, `lesson_resources/${lessonCourseId}`);
      setLessonResourceUrl(url);
      if (!lessonResourceTitle.trim()) {
        setLessonResourceTitle(file.name);
      }
      setNotice('Downloadable resource uploaded to Firebase Storage.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resource upload failed.');
    } finally {
      setUploadingResource(false);
    }
  };

  const resetLessonForm = (nextOrder: number) => {
    setEditingLessonId(null);
    setLessonTitle('');
    setLessonOrder(nextOrder);
    setLessonDuration('20 min');
    setLessonSummary('');
    setLessonVideoUrl('');
    setLessonResourceTitle('');
    setLessonResourceUrl('');
    setLessonResourceContent('');
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonCourseId) return;
    setError(null);
    setNotice(null);

    const lessonId = editingLessonId || `lesson_${Date.now()}`;
    try {
      await saveLesson(
        {
          id: lessonId,
          courseId: lessonCourseId,
          order: Number(lessonOrder) || 1,
          title: lessonTitle.trim().slice(0, 160),
          duration: lessonDuration.trim().slice(0, 40),
          summary: lessonSummary.trim().slice(0, 2000),
          videoUrl: (lessonVideoUrl.trim() || `interactive://${lessonCourseId}/${lessonOrder}`).slice(
            0,
            1000,
          ),
          resourceTitle: (lessonResourceTitle.trim() || `${lessonTitle.trim()} Study Notes`).slice(
            0,
            160,
          ),
          ...(lessonResourceUrl.trim()
            ? { resourceUrl: lessonResourceUrl.trim().slice(0, 1000) }
            : {}),
          resourceContent: (
            lessonResourceContent.trim() || `# ${lessonTitle.trim()}\n\n${lessonSummary.trim()}`
          ).slice(0, 10000),
        },
        !editingLessonId,
      );
      const updated = await fetchLessons(lessonCourseId);
      setCourseLessons([...updated].sort((a, b) => a.order - b.order));
      resetLessonForm(updated.length + 1);
      setNotice('Lesson saved to course curriculum.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save lesson.');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      await deleteLesson(lessonCourseId, lessonId, courseLessons.length - 1);
      const updated = courseLessons.filter((l) => l.id !== lessonId);
      setCourseLessons(updated);
      setNotice('Lesson removed.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lesson.');
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setError(null);
    const id =
      editingCatId ||
      catName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    try {
      await saveCategory({
        id,
        name: catName.trim().slice(0, 80),
        description: catDescription.trim().slice(0, 400),
        active: true,
        sortOrder: Number(catOrder) || 1,
      });
      setCatName('');
      setCatDescription('');
      setCatOrder(categories.length + 1);
      setEditingCatId(null);
      setNotice('Category saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category.');
    }
  };

  const handleToggleCategoryActive = async (cat: CategoryConfig) => {
    try {
      await saveCategory({ ...cat, active: !cat.active });
      setNotice(`Category "${cat.name}" ${!cat.active ? 'activated' : 'hidden'}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category.');
    }
  };

  const handleSaveLevel = async (lvl: CourseLevelConfig) => {
    try {
      await saveCourseLevel({
        id: lvl.id,
        name: lvl.name,
        description: lvl.description,
        sortOrder: Number(lvl.sortOrder) || 1,
        active: lvl.active,
      });
      setNotice(`Saved level configuration for ${lvl.name}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update level.');
    }
  };

  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.uid === certStudentUid);
    const course = courses.find((c) => c.id === certCourseId);
    if (!student || !course) {
      setError('Please select both a registered student and a course.');
      return;
    }

    try {
      const issued = await issueCertificateAdmin({
        userId: student.uid,
        studentName: `${student.firstName} ${student.lastName}`.trim(),
        course,
        issuedBy: user?.displayName || 'Learn It With AI Administration',
      });
      setAllCertificates((prev) => [issued, ...prev.filter((c) => c.id !== issued.id)]);
      setNotice(`Certificate ${issued.certificateCode} issued to ${issued.studentName}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to issue certificate.');
    }
  };

  const handleSaveSiteContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await saveSiteContent({ ...contentForm, id: 'main' });
      setNotice('Website content and announcement saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update site content.');
    }
  };

  const handleResolveMessage = async (id: string) => {
    try {
      await resolveContactMessageAdmin(id);
      setContactMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: 'resolved' } : m)),
      );
      setNotice('Contact inquiry marked as resolved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update inquiry.');
    }
  };

  const filteredStudents = students.filter((st) => {
    if (studentLevelFilter !== 'All' && st.selectedLevel !== studentLevelFilter) return false;
    if (studentQuery.trim()) {
      const q = studentQuery.toLowerCase();
      const full = `${st.firstName} ${st.lastName} ${st.email} ${st.country}`.toLowerCase();
      return full.includes(q);
    }
    return true;
  });

  const completedCount = allEnrollments.filter((e) => {
    const prog = allProgress.find((p) => p.userId === e.userId && p.courseId === e.courseId);
    return prog?.status === 'completed' || e.status === 'completed';
  }).length;

  const completionRate =
    allEnrollments.length > 0 ? Math.round((completedCount / allEnrollments.length) * 100) : 0;

  return (
    <div className="bg-[#100B20] text-white">
      <div className="mx-auto max-w-[1280px] px-6 py-10 lg:py-14">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#A855F7]">
              Learn It With AI · Administration
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold text-white">Admin Dashboard</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isCatalogSyncedToFirestore && (
              <button
                type="button"
                onClick={async () => {
                  await seedStarterCatalogToFirestore();
                  setNotice('Starter courses, categories, levels, and lessons synced to Firestore.');
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-[#6D28D9] px-4 py-2 text-xs font-semibold text-white hover:bg-[#7C3AED]"
              >
                <Plus className="h-3.5 w-3.5" />
                Sync Starter Catalog to Firestore
              </button>
            )}
            <button
              type="button"
              onClick={loadAdminRecords}
              disabled={loadingAdminData}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-white hover:border-[#A855F7]"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingAdminData ? 'animate-spin' : ''}`} />
              Refresh Stats
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-1.5">
          {(
            [
              { id: 'overview', label: 'Platform Statistics' },
              { id: 'courses', label: 'Manage Courses' },
              { id: 'lessons', label: 'Lessons & Videos' },
              { id: 'students', label: 'Students & Progress' },
              { id: 'categories', label: 'Categories' },
              { id: 'levels', label: 'Course Levels' },
              { id: 'certificates', label: 'Issue Certificates' },
              { id: 'content', label: 'Website Content & Inbox' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                tab === item.id
                  ? 'bg-[#6D28D9] text-white'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {notice && (
          <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-200">
            {notice}
          </div>
        )}
        {error && (
          <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-200">
            {error}
          </div>
        )}

        {/* TAB: OVERVIEW */}
        {tab === 'overview' && (
          <div className="mt-8 space-y-8">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              <div className="rounded-xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-5">
                <Users className="h-5 w-5 text-[#A855F7]" />
                <p className="mt-3 text-xs text-slate-400">Total Students</p>
                <p className="mt-1 font-display text-2xl font-bold tabular-nums text-white">
                  {students.length}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-5">
                <BookOpen className="h-5 w-5 text-[#A855F7]" />
                <p className="mt-3 text-xs text-slate-400">Active Courses</p>
                <p className="mt-1 font-display text-2xl font-bold tabular-nums text-white">
                  {courses.length}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-5">
                <Layers className="h-5 w-5 text-[#A855F7]" />
                <p className="mt-3 text-xs text-slate-400">Enrollments</p>
                <p className="mt-1 font-display text-2xl font-bold tabular-nums text-white">
                  {allEnrollments.length}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-5">
                <Award className="h-5 w-5 text-[#A855F7]" />
                <p className="mt-3 text-xs text-slate-400">Certificates Issued</p>
                <p className="mt-1 font-display text-2xl font-bold tabular-nums text-white">
                  {allCertificates.length}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-5">
                <p className="text-xs text-slate-400">Completion Rate</p>
                <p className="mt-4 font-display text-2xl font-bold tabular-nums text-[#C084FC]">
                  {completionRate}%
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-6">
              <h2 className="font-display text-lg font-semibold text-white">
                Category Distribution
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {categories.map((cat) => {
                  const catCourses = courses.filter((c) => c.category === cat.name).length;
                  const catEnrolls = allEnrollments.filter(
                    (e) => e.courseCategory === cat.name,
                  ).length;
                  return (
                    <div
                      key={cat.id}
                      className="rounded-xl border border-white/10 bg-[#100B20] p-4"
                    >
                      <p className="text-xs font-semibold text-[#C084FC]">{cat.name}</p>
                      <p className="mt-2 text-lg font-bold tabular-nums text-white">
                        {catCourses} courses
                      </p>
                      <p className="mt-0.5 text-xs tabular-nums text-slate-400">
                        {catEnrolls} enrollments
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB: COURSES */}
        {tab === 'courses' && (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <form
              onSubmit={handleSaveCourse}
              className="space-y-4 rounded-2xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-6 lg:col-span-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-white">
                  {editingCourseId ? 'Edit Course' : 'Add New Course'}
                </h2>
                {editingCourseId && (
                  <button
                    type="button"
                    onClick={resetCourseForm}
                    className="text-xs text-[#C084FC] hover:text-white"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs text-slate-300">Course Title</label>
                <input
                  type="text"
                  required
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="e.g. Modern TypeScript & AI Systems"
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300">Category</label>
                  <select
                    value={courseCategory}
                    onChange={(e) => setCourseCategory(e.target.value as CourseCategory)}
                    className="mt-1 w-full rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-300">Level</label>
                  <select
                    value={courseLevel}
                    onChange={(e) => setCourseLevel(e.target.value as CourseLevel)}
                    className="mt-1 w-full rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                  >
                    {COURSE_LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300">Instructor</label>
                  <input
                    type="text"
                    required
                    value={courseInstructor}
                    onChange={(e) => setCourseInstructor(e.target.value)}
                    placeholder="Instructor name"
                    className="mt-1 w-full rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300">Duration</label>
                  <input
                    type="text"
                    required
                    value={courseDuration}
                    onChange={(e) => setCourseDuration(e.target.value)}
                    placeholder="5h 30m"
                    className="mt-1 w-full rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300">Instructor Bio (optional)</label>
                <input
                  type="text"
                  value={courseInstructorBio}
                  onChange={(e) => setCourseInstructorBio(e.target.value)}
                  placeholder="Senior engineer & educator..."
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300">Description</label>
                <textarea
                  rows={3}
                  required
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  placeholder="Describe the course curriculum and outcomes..."
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300">
                  Course Thumbnail URL or Upload
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={courseThumbnailUrl}
                    onChange={(e) => setCourseThumbnailUrl(e.target.value)}
                    placeholder="https://... or upload file"
                    className="flex-1 rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                  />
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-xs font-semibold text-white hover:border-[#A855F7]">
                    <Upload className="h-3.5 w-3.5" />
                    {uploadingThumb ? '...' : 'Upload'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadThumbnail}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={coursePublished}
                  onChange={(e) => setCoursePublished(e.target.checked)}
                  className="accent-[#A855F7]"
                />
                Published in public catalog
              </label>

              <button
                type="submit"
                className="w-full rounded-lg bg-[#6D28D9] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7C3AED]"
              >
                {editingCourseId ? 'Update Course' : 'Create Course'}
              </button>
            </form>

            <div className="rounded-2xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-6 lg:col-span-7">
              <h2 className="font-display text-lg font-semibold text-white">
                Course Directory ({courses.length})
              </h2>
              <div className="mt-4 space-y-3">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-[#100B20] p-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={course.thumbnailUrl || CATEGORY_IMAGES[course.category]}
                        alt={course.title}
                        referrerPolicy="no-referrer"
                        className="h-12 w-16 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-xs text-[#C084FC]">
                          {course.category} · {course.level} ·{' '}
                          <span className="tabular-nums">{course.lessonCount} lessons</span>
                        </p>
                        <p className="truncate text-sm font-semibold text-white">{course.title}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditCourse(course)}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:border-[#A855F7]"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCourse(course.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: LESSONS & VIDEOS */}
        {tab === 'lessons' && (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <form
              onSubmit={handleSaveLesson}
              className="space-y-4 rounded-2xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-6 lg:col-span-5"
            >
              <h2 className="font-display text-lg font-semibold text-white">
                {editingLessonId ? 'Edit Lesson' : 'Add Lesson & Video'}
              </h2>

              <div>
                <label className="block text-xs text-slate-300">Target Course</label>
                <select
                  value={lessonCourseId}
                  onChange={(e) => setLessonCourseId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs text-slate-300">Lesson Title</label>
                  <input
                    type="text"
                    required
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder="Lesson title"
                    className="mt-1 w-full rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300">Order</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={lessonOrder}
                    onChange={(e) => setLessonOrder(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300">Duration</label>
                <input
                  type="text"
                  required
                  value={lessonDuration}
                  onChange={(e) => setLessonDuration(e.target.value)}
                  placeholder="25 min"
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300">Lesson Summary</label>
                <textarea
                  rows={2}
                  required
                  value={lessonSummary}
                  onChange={(e) => setLessonSummary(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300">Video URL or Upload Video</label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={lessonVideoUrl}
                    onChange={(e) => setLessonVideoUrl(e.target.value)}
                    placeholder="MP4 / YouTube URL or upload"
                    className="flex-1 rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                  />
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-xs font-semibold text-white hover:border-[#A855F7]">
                    <Upload className="h-3.5 w-3.5" />
                    {uploadingVideo ? '...' : 'Upload'}
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleUploadLessonVideo}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300">Downloadable Resource Title</label>
                <input
                  type="text"
                  value={lessonResourceTitle}
                  onChange={(e) => setLessonResourceTitle(e.target.value)}
                  placeholder="Worksheet / Cheatsheet Title"
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300">
                  Resource File URL or Upload PDF/ZIP
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={lessonResourceUrl}
                    onChange={(e) => setLessonResourceUrl(e.target.value)}
                    placeholder="https://... or upload file"
                    className="flex-1 rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                  />
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-xs font-semibold text-white hover:border-[#A855F7]">
                    <Upload className="h-3.5 w-3.5" />
                    {uploadingResource ? '...' : 'Upload'}
                    <input
                      type="file"
                      onChange={handleUploadLessonResource}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300">
                  Resource Notes (Downloadable Markdown)
                </label>
                <textarea
                  rows={3}
                  value={lessonResourceContent}
                  onChange={(e) => setLessonResourceContent(e.target.value)}
                  placeholder="# Study Notes..."
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-[#6D28D9] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7C3AED]"
                >
                  {editingLessonId ? 'Update Lesson' : 'Save Lesson'}
                </button>
                {editingLessonId && (
                  <button
                    type="button"
                    onClick={() => resetLessonForm(courseLessons.length + 1)}
                    className="rounded-lg border border-white/15 px-4 py-2.5 text-xs font-semibold text-white"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="rounded-2xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-6 lg:col-span-7">
              <h2 className="font-display text-lg font-semibold text-white">
                Lessons in Selected Course ({courseLessons.length})
              </h2>
              <div className="mt-4 space-y-3">
                {courseLessons.map((l) => (
                  <div
                    key={l.id}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-[#100B20] p-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="text-xs text-[#C084FC]">
                        Lesson {l.order} · {l.duration}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-white">{l.title}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingLessonId(l.id);
                          setLessonTitle(l.title);
                          setLessonOrder(l.order);
                          setLessonDuration(l.duration);
                          setLessonSummary(l.summary);
                          setLessonVideoUrl(l.videoUrl);
                          setLessonResourceTitle(l.resourceTitle);
                          setLessonResourceUrl(l.resourceUrl || '');
                          setLessonResourceContent(l.resourceContent);
                        }}
                        className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:border-[#A855F7]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLesson(l.id)}
                        className="rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: STUDENTS & PROGRESS */}
        {tab === 'students' && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <h2 className="font-display text-lg font-semibold text-white">
                Registered Students &amp; Progress ({filteredStudents.length})
              </h2>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={studentQuery}
                    onChange={(e) => setStudentQuery(e.target.value)}
                    placeholder="Search student or country..."
                    className="rounded-lg border border-white/15 bg-[#100B20] py-2 pl-8 pr-3 text-xs text-white placeholder:text-slate-500 focus:border-[#A855F7] focus:outline-none"
                  />
                </div>
                <select
                  value={studentLevelFilter}
                  onChange={(e) => setStudentLevelFilter(e.target.value)}
                  className="rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-xs text-white focus:border-[#A855F7] focus:outline-none"
                >
                  <option value="All">All Levels</option>
                  {COURSE_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <p className="mt-6 text-sm text-slate-400">No matching students found.</p>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-white/10 text-xs text-slate-400">
                    <tr>
                      <th className="py-3 pr-4">Student</th>
                      <th className="py-3 pr-4">Location</th>
                      <th className="py-3 pr-4">Selected Level</th>
                      <th className="py-3 pr-4">Enrollments &amp; Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/8">
                    {filteredStudents.map((st) => {
                      const stEnrollments = allEnrollments.filter((e) => e.userId === st.uid);
                      return (
                        <tr key={st.uid} className="align-top">
                          <td className="py-4 pr-4">
                            <p className="font-semibold text-white">
                              {st.firstName} {st.lastName}
                            </p>
                            <p className="text-xs text-slate-400">{st.email}</p>
                            {st.phone && <p className="text-xs text-slate-500">{st.phone}</p>}
                          </td>
                          <td className="py-4 pr-4 text-xs text-slate-300">
                            {[st.townOrCity, st.countyOrState, st.country]
                              .filter(Boolean)
                              .join(', ') || '—'}
                          </td>
                          <td className="py-4 pr-4 text-xs text-[#C084FC]">
                            {st.selectedLevel}
                          </td>
                          <td className="py-4 pr-4">
                            {stEnrollments.length === 0 ? (
                              <span className="text-xs text-slate-500">No course enrollments</span>
                            ) : (
                              <div className="space-y-2">
                                {stEnrollments.map((enr) => {
                                  const prog = allProgress.find(
                                    (p) => p.userId === st.uid && p.courseId === enr.courseId,
                                  );
                                  const pct = prog?.progressPercent ?? 0;
                                  const status = prog?.status || enr.status;
                                  return (
                                    <div key={enr.id} className="text-xs">
                                      <div className="flex items-center justify-between gap-4">
                                        <span className="text-slate-200">{enr.courseTitle}</span>
                                        <span className="font-mono tabular-nums text-[#C084FC]">
                                          {pct}% ({status})
                                        </span>
                                      </div>
                                      <div className="mt-1 h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
                                        <div
                                          className="h-full bg-[#A855F7]"
                                          style={{ width: `${pct}%` }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB: CATEGORIES */}
        {tab === 'categories' && (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <form
              onSubmit={handleSaveCategory}
              className="space-y-4 rounded-2xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-6 lg:col-span-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-white">
                  {editingCatId ? 'Edit Category' : 'Add Course Category'}
                </h2>
                {editingCatId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCatId(null);
                      setCatName('');
                      setCatDescription('');
                    }}
                    className="text-xs text-[#C084FC]"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs text-slate-300">Category Name</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Web Design"
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300">Sort Order</label>
                <input
                  type="number"
                  min={1}
                  value={catOrder}
                  onChange={(e) => setCatOrder(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300">Category Description</label>
                <textarea
                  rows={3}
                  required
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  placeholder="Describe what learners master in this category..."
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-[#6D28D9] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7C3AED]"
              >
                {editingCatId ? 'Update Category' : 'Save Category'}
              </button>
            </form>

            <div className="rounded-2xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-6 lg:col-span-7">
              <h2 className="font-display text-lg font-semibold text-white">
                Learning Categories ({categories.length})
              </h2>
              <div className="mt-4 space-y-3">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-[#100B20] p-4 sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {cat.name}{' '}
                        <span className="ml-2 text-xs font-normal text-[#C084FC]">
                          {cat.active ? 'Active' : 'Hidden'}
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-slate-400">{cat.description}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCatId(cat.id);
                          setCatName(cat.name);
                          setCatDescription(cat.description);
                          setCatOrder(cat.sortOrder);
                        }}
                        className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:border-[#A855F7]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleCategoryActive(cat)}
                        className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
                      >
                        {cat.active ? 'Hide' : 'Show'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCategory(cat.id)}
                        className="rounded-lg border border-rose-500/30 px-3 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: COURSE LEVELS */}
        {tab === 'levels' && (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {levelEdits.map((lvl, idx) => (
              <div
                key={lvl.id}
                className="space-y-4 rounded-2xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-white">{lvl.name}</h2>
                  <label className="flex items-center gap-2 text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={lvl.active}
                      onChange={(e) => {
                        const copy = [...levelEdits];
                        copy[idx] = { ...lvl, active: e.target.checked };
                        setLevelEdits(copy);
                      }}
                      className="accent-[#A855F7]"
                    />
                    Active
                  </label>
                </div>

                <div>
                  <label className="block text-xs text-slate-400">Sort Order</label>
                  <input
                    type="number"
                    min={1}
                    value={lvl.sortOrder}
                    onChange={(e) => {
                      const copy = [...levelEdits];
                      copy[idx] = { ...lvl, sortOrder: Number(e.target.value) };
                      setLevelEdits(copy);
                    }}
                    className="mt-1 w-full rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400">Tier Description</label>
                  <textarea
                    rows={3}
                    value={lvl.description}
                    onChange={(e) => {
                      const copy = [...levelEdits];
                      copy[idx] = { ...lvl, description: e.target.value };
                      setLevelEdits(copy);
                    }}
                    className="mt-1 w-full rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveLevel(lvl)}
                  className="w-full rounded-lg bg-[#6D28D9] px-4 py-2 text-xs font-semibold text-white hover:bg-[#7C3AED]"
                >
                  Save {lvl.name} Tier
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB: ISSUE CERTIFICATES */}
        {tab === 'certificates' && (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <form
              onSubmit={handleIssueCertificate}
              className="space-y-4 rounded-2xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-6 lg:col-span-5"
            >
              <h2 className="font-display text-lg font-semibold text-white">
                Issue Completion Certificate
              </h2>
              <div>
                <label className="block text-xs text-slate-300">Select Student</label>
                <select
                  value={certStudentUid}
                  onChange={(e) => setCertStudentUid(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#100B20] px-3 py-2.5 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                >
                  {students.map((st) => (
                    <option key={st.uid} value={st.uid}>
                      {st.firstName} {st.lastName} ({st.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300">Select Course</label>
                <select
                  value={certCourseId}
                  onChange={(e) => setCertCourseId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#100B20] px-3 py-2.5 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.level})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={students.length === 0}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#6D28D9] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7C3AED] disabled:opacity-50"
              >
                <Award className="h-4 w-4" />
                Issue Certificate
              </button>
            </form>

            <div className="rounded-2xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-6 lg:col-span-7">
              <h2 className="font-display text-lg font-semibold text-white">
                Issued Certificates ({allCertificates.length})
              </h2>
              <div className="mt-4 space-y-3">
                {allCertificates.length === 0 ? (
                  <p className="text-sm text-slate-400">No certificates issued yet.</p>
                ) : (
                  allCertificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="flex flex-col justify-between gap-2 rounded-xl border border-white/10 bg-[#100B20] p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{cert.studentName}</p>
                        <p className="text-xs text-slate-400">
                          {cert.courseTitle} · {cert.level}
                        </p>
                      </div>
                      <span className="font-mono text-xs text-[#C084FC]">
                        {cert.certificateCode}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: WEBSITE CONTENT & INBOX */}
        {tab === 'content' && (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <form
              onSubmit={handleSaveSiteContent}
              className="space-y-4 rounded-2xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-6 lg:col-span-6"
            >
              <h2 className="font-display text-lg font-semibold text-white">
                Manage Website Content
              </h2>

              <div>
                <label className="block text-xs text-slate-300">Hero Headline</label>
                <input
                  type="text"
                  required
                  value={contentForm.heroHeadline}
                  onChange={(e) =>
                    setContentForm((prev) => ({ ...prev, heroHeadline: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300">Hero Subtext</label>
                <textarea
                  rows={3}
                  required
                  value={contentForm.heroSubtext}
                  onChange={(e) =>
                    setContentForm((prev) => ({ ...prev, heroSubtext: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300">Top Announcement Banner</label>
                <input
                  type="text"
                  value={contentForm.announcement}
                  onChange={(e) =>
                    setContentForm((prev) => ({ ...prev, announcement: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs text-slate-300">Support Email</label>
                  <input
                    type="email"
                    required
                    value={contentForm.contactEmail}
                    onChange={(e) =>
                      setContentForm((prev) => ({ ...prev, contactEmail: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300">Support Phone</label>
                  <input
                    type="text"
                    value={contentForm.contactPhone}
                    onChange={(e) =>
                      setContentForm((prev) => ({ ...prev, contactPhone: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300">Campus / Location Label</label>
                <input
                  type="text"
                  value={contentForm.contactLocation}
                  onChange={(e) =>
                    setContentForm((prev) => ({ ...prev, contactLocation: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-white/15 bg-[#100B20] px-3 py-2 text-sm text-white focus:border-[#A855F7] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-[#6D28D9] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7C3AED]"
              >
                Publish Website Content
              </button>
            </form>

            <div className="rounded-2xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-6 lg:col-span-6">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#A855F7]" />
                <h2 className="font-display text-lg font-semibold text-white">
                  Contact Inbox ({contactMessages.length})
                </h2>
              </div>

              <div className="mt-4 space-y-3">
                {contactMessages.length === 0 ? (
                  <p className="text-sm text-slate-400">No contact inquiries received yet.</p>
                ) : (
                  contactMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="rounded-xl border border-white/10 bg-[#100B20] p-4 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-white">{msg.subject}</p>
                          <p className="mt-0.5 text-slate-400">
                            {msg.name} · {msg.email}
                          </p>
                        </div>
                        {msg.status === 'resolved' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-300">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Resolved
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleResolveMessage(msg.id)}
                            className="rounded-lg border border-white/15 px-2.5 py-1 font-semibold text-white hover:border-[#A855F7]"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                      <p className="mt-2.5 leading-relaxed text-slate-300">{msg.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
