import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Award, CheckCircle2, Circle, Download, FileText, Lock, PlayCircle } from 'lucide-react';
import CertificateModal from '../components/CertificateModal';
import LessonVideoPlayer from '../components/LessonVideoPlayer';
import { useAcademy } from '../context/AcademyContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORY_IMAGES } from '../data/sampleCourses';
import { Certificate, Lesson } from '../types/academy';

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    courses,
    enrollments,
    certificates,
    fetchLessons,
    enrollInCourse,
    toggleLessonComplete,
  } = useAcademy();

  const course = courses.find((c) => c.id === courseId);
  const enrollment = enrollments.find((e) => e.courseId === courseId);
  const certificate = certificates.find((c) => c.courseId === courseId);

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string>('');
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [busyEnroll, setBusyEnroll] = useState(false);
  const [busyToggle, setBusyToggle] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!courseId) return;
    setLoadingLessons(true);
    fetchLessons(courseId)
      .then((list) => {
        if (!mounted) return;
        const sorted = [...list].sort((a, b) => a.order - b.order);
        setLessons(sorted);
        if (sorted.length > 0) {
          setActiveLessonId(sorted[0].id);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (mounted) setLoadingLessons(false);
      });
    return () => {
      mounted = false;
    };
  }, [courseId, fetchLessons]);

  if (!course) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-20 text-center">
        <div className="rounded-2xl border border-white/10 bg-[#17112B] p-12">
          <h1 className="font-display text-2xl font-bold text-white">Course not found</h1>
          <p className="mt-2 text-sm text-slate-400">
            The requested course could not be located in the LIWAI ACADEMY catalog.
          </p>
          <Link
            to="/courses"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#6D28D9] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Back to All Courses
          </Link>
        </div>
      </div>
    );
  }

  const activeLesson = lessons.find((l) => l.id === activeLessonId) || lessons[0];
  const completedIds = new Set(enrollment?.completedLessonIds || []);
  const progressPercent = enrollment?.progressPercent ?? 0;

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/courses/${course.id}` } });
      return;
    }
    setBusyEnroll(true);
    setErrorMessage(null);
    try {
      await enrollInCourse(course);
      setStatusMessage('Enrolled successfully. Your progress is now tracked.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to enroll right now.');
    } finally {
      setBusyEnroll(false);
    }
  };

  const handleToggleLesson = async (lessonId: string) => {
    if (!user) {
      navigate('/login', { state: { from: `/courses/${course.id}` } });
      return;
    }
    setBusyToggle(lessonId);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const result = await toggleLessonComplete(course, lessons, lessonId);
      if (result.certificateIssued) {
        setStatusMessage('Course completed! Your certificate has been issued.');
        setPreviewCert(result.certificateIssued);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to update lesson status.');
    } finally {
      setBusyToggle(null);
    }
  };

  const handleDownloadResource = (lesson: Lesson) => {
    if (lesson.resourceUrl && lesson.resourceUrl.startsWith('http')) {
      const a = document.createElement('a');
      a.href = lesson.resourceUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.download = lesson.resourceTitle || 'resource';
      a.click();
      return;
    }
    const content = lesson.resourceContent || `${lesson.title}\n\n${lesson.summary}`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const slug = (lesson.resourceTitle || lesson.title).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    a.download = `${slug}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#100B20] text-white">
      <div className="mx-auto max-w-[1280px] px-6 py-10 lg:py-14">
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to All Courses
        </Link>

        {/* Course Header */}
        <div className="mt-6 grid grid-cols-1 gap-8 border-b border-white/10 pb-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-[#C084FC]">{course.category}</span>
              <span aria-hidden="true">·</span>
              <span>{course.level}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{lessons.length || course.lessonCount} Lessons</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{course.duration}</span>
            </div>

            <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-4xl text-balance">
              {course.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-300">
              {course.description}
            </p>
            <p className="mt-4 text-sm text-slate-400">
              Instructor: <span className="font-semibold text-white">{course.instructor}</span>
            </p>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#17112B] p-6 lg:col-span-4">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Learning Progress</span>
                <span className="font-mono tabular-nums text-[#C084FC]">{progressPercent}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-[#A855F7] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Status:{' '}
                <span className="font-semibold text-white">
                  {enrollment
                    ? enrollment.status === 'completed'
                      ? 'Completed'
                      : 'In Progress'
                    : 'Not Enrolled'}
                </span>
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              {!enrollment ? (
                <button
                  type="button"
                  disabled={busyEnroll}
                  onClick={handleEnroll}
                  className="w-full rounded-lg bg-[#6D28D9] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7C3AED] disabled:opacity-60"
                >
                  {busyEnroll
                    ? 'Enrolling...'
                    : user
                    ? 'Enroll in This Course'
                    : 'Sign In to Enroll'}
                </button>
              ) : certificate ? (
                <button
                  type="button"
                  onClick={() => setPreviewCert(certificate)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#6D28D9] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7C3AED]"
                >
                  <Award className="h-4 w-4" />
                  View Earned Certificate
                </button>
              ) : (
                <div className="rounded-lg border border-white/10 bg-[#100B20] px-4 py-2.5 text-center text-xs text-slate-300">
                  Complete all lessons to unlock your certificate
                </div>
              )}
            </div>
          </div>
        </div>

        {statusMessage && (
          <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {statusMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {errorMessage}
          </div>
        )}

        {/* Two-Zone Course Learning Studio */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main Video & Resource Stage */}
          <div className="lg:col-span-8">
            {loadingLessons ? (
              <div className="aspect-video w-full animate-pulse rounded-xl border border-white/10 bg-[#17112B]" />
            ) : activeLesson ? (
              <div>
                <LessonVideoPlayer
                  lesson={activeLesson}
                  courseTitle={course.title}
                  thumbnailUrl={course.thumbnailUrl || CATEGORY_IMAGES[course.category]}
                />

                <div className="mt-6 rounded-xl border border-white/10 bg-[#17112B] p-6">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-xs font-medium text-[#A855F7]">
                        Lesson {activeLesson.order} · {activeLesson.duration}
                      </p>
                      <h2 className="mt-1 font-display text-xl font-bold text-white">
                        {activeLesson.title}
                      </h2>
                    </div>

                    <button
                      type="button"
                      disabled={busyToggle === activeLesson.id}
                      onClick={() => handleToggleLesson(activeLesson.id)}
                      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        completedIds.has(activeLesson.id)
                          ? 'border border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
                          : 'bg-[#6D28D9] text-white hover:bg-[#7C3AED]'
                      }`}
                    >
                      {completedIds.has(activeLesson.id) ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Lesson Completed
                        </>
                      ) : (
                        <>
                          <Circle className="h-4 w-4" />
                          {busyToggle === activeLesson.id ? 'Saving...' : 'Mark as Complete'}
                        </>
                      )}
                    </button>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-slate-300">
                    {activeLesson.summary}
                  </p>

                  {/* Downloadable Resource */}
                  <div className="mt-6 flex flex-col justify-between gap-4 rounded-xl border border-white/10 bg-[#100B20] p-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-[#A855F7] shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400">Downloadable Resource</p>
                        <p className="text-sm font-medium text-white">
                          {activeLesson.resourceTitle || `${activeLesson.title} Guide`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadResource(activeLesson)}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#17112B] px-4 py-2 text-xs font-semibold text-white hover:border-[#A855F7] whitespace-nowrap shrink-0"
                    >
                      <Download className="h-4 w-4" />
                      Download Resource
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-[#17112B] p-10 text-center text-sm text-slate-400">
                No lessons have been published for this course yet.
              </div>
            )}
          </div>

          {/* Curriculum Playlist Sidebar */}
          <aside className="lg:col-span-4">
            <div className="rounded-xl border border-white/10 bg-[#17112B] p-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="font-display text-base font-semibold text-white">
                  Course Curriculum
                </h2>
                <span className="font-mono text-xs tabular-nums text-slate-400">
                  {completedIds.size}/{lessons.length}
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                {lessons.map((lesson) => {
                  const isActive = activeLesson?.id === lesson.id;
                  const isDone = completedIds.has(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => setActiveLessonId(lesson.id)}
                      className={`w-full rounded-xl border p-3.5 text-left transition-colors ${
                        isActive
                          ? 'border-[#A855F7] bg-[#6D28D9]/20'
                          : 'border-white/8 bg-[#100B20] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          {isDone ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400 shrink-0" />
                          ) : user ? (
                            <PlayCircle className="mt-0.5 h-4 w-4 text-[#A855F7] shrink-0" />
                          ) : (
                            <Lock className="mt-0.5 h-4 w-4 text-slate-500 shrink-0" />
                          )}
                          <div>
                            <p className="text-xs font-medium text-slate-400">
                              Lesson {lesson.order} · {lesson.duration}
                            </p>
                            <p className="mt-0.5 text-sm font-semibold text-white">
                              {lesson.title}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {previewCert && (
        <CertificateModal certificate={previewCert} onClose={() => setPreviewCert(null)} />
      )}
    </div>
  );
}
