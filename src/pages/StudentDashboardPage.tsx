import { Link } from 'react-router-dom';
import { ArrowRight, Award, BookOpen, Compass, Settings } from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORY_IMAGES } from '../data/sampleCourses';

export default function StudentDashboardPage() {
  const { user, profile, isAdmin } = useAuth();
  const { courses, enrollments, certificates } = useAcademy();

  const fullName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : user?.displayName || 'LIWAI Student';

  const initials = fullName
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const activeEnrollments = enrollments.filter((e) => e.status !== 'completed');
  const completedEnrollments = enrollments.filter((e) => e.status === 'completed');
  const continueItem = activeEnrollments[0] || enrollments[0];
  const continueCourse = continueItem
    ? courses.find((c) => c.id === continueItem.courseId)
    : courses.find((c) => c.id === profile?.selectedCourseId) || courses[0];

  const averageProgress =
    enrollments.length > 0
      ? Math.round(enrollments.reduce((acc, e) => acc + e.progressPercent, 0) / enrollments.length)
      : 0;

  return (
    <div className="bg-[#100B20] text-white">
      <div className="mx-auto max-w-[1280px] px-6 py-10 lg:py-14">
        {/* Student Header */}
        <div className="flex flex-col justify-between gap-6 rounded-2xl border border-white/10 bg-[#17112B] p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-center gap-4">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={fullName}
                referrerPolicy="no-referrer"
                className="h-16 w-16 rounded-xl border border-white/15 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#6D28D9] font-display text-xl font-bold text-white">
                {initials || 'LA'}
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-[#C084FC]">
                Student Dashboard · {profile?.selectedLevel || 'Beginner'} Track
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">
                Welcome back, {fullName}
              </h1>
              <p className="mt-1 text-xs text-slate-400">
                {profile?.townOrCity
                  ? `${profile.townOrCity}, ${profile.country}`
                  : user?.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/prompt-generator"
              className="inline-flex items-center gap-2 rounded-lg bg-[#6D28D9] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#7C3AED]"
            >
              <Compass className="h-4 w-4" />
              AI Prompt Generator
            </Link>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-xs font-semibold text-white hover:border-[#A855F7]"
            >
              <Settings className="h-4 w-4" />
              Profile Settings
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 rounded-lg border border-[#A855F7]/60 bg-[#6D28D9]/20 px-4 py-2.5 text-xs font-semibold text-[#C084FC]"
              >
                Admin Console
              </Link>
            )}
          </div>
        </div>

        {/* KPI Row */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-[#17112B] p-5">
            <p className="text-xs text-slate-400">Enrolled Courses</p>
            <p className="mt-2 font-display text-3xl font-bold tabular-nums text-white">
              {enrollments.length}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#17112B] p-5">
            <p className="text-xs text-slate-400">Average Progress</p>
            <p className="mt-2 font-display text-3xl font-bold tabular-nums text-[#C084FC]">
              {averageProgress}%
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#17112B] p-5">
            <p className="text-xs text-slate-400">Completed Courses</p>
            <p className="mt-2 font-display text-3xl font-bold tabular-nums text-white">
              {completedEnrollments.length}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#17112B] p-5">
            <p className="text-xs text-slate-400">Certificates Earned</p>
            <p className="mt-2 font-display text-3xl font-bold tabular-nums text-white">
              {certificates.length}
            </p>
          </div>
        </div>

        {/* Continue Learning & Quick Workspace */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-8">
            {/* Continue Learning Spotlight */}
            <section className="rounded-2xl border border-white/10 bg-[#17112B] p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-white">Continue Learning</h2>
                <Link
                  to="/my-learning"
                  className="text-xs font-semibold text-[#C084FC] hover:text-white"
                >
                  Open My Learning →
                </Link>
              </div>

              {continueCourse ? (
                <div className="mt-4 flex flex-col gap-5 rounded-xl border border-white/10 bg-[#100B20] p-5 sm:flex-row sm:items-center">
                  <img
                    src={continueCourse.thumbnailUrl || CATEGORY_IMAGES[continueCourse.category]}
                    alt={continueCourse.title}
                    referrerPolicy="no-referrer"
                    className="h-28 w-full rounded-lg object-cover sm:w-44 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#C084FC]">
                      {continueCourse.category} · {continueCourse.level}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-bold text-white">
                      {continueCourse.title}
                    </h3>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Course Progress</span>
                        <span className="font-mono tabular-nums text-white">
                          {continueItem ? continueItem.progressPercent : 0}%
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full bg-[#A855F7]"
                          style={{ width: `${continueItem ? continueItem.progressPercent : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/courses/${continueCourse.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6D28D9] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#7C3AED] whitespace-nowrap shrink-0"
                  >
                    {continueItem ? 'Resume Course' : 'Start Course'}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-white/10 bg-[#100B20] p-6 text-sm text-slate-300">
                  Browse the catalog to enroll in your first course.
                </div>
              )}
            </section>

            {/* Enrolled Courses List */}
            <section className="rounded-2xl border border-white/10 bg-[#17112B] p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-white">
                  Enrolled Courses ({enrollments.length})
                </h2>
                <Link to="/courses" className="text-xs font-semibold text-[#C084FC] hover:text-white">
                  Browse more courses
                </Link>
              </div>

              {enrollments.length === 0 ? (
                <div className="mt-4 rounded-xl border border-white/10 bg-[#100B20] p-6 text-center">
                  <BookOpen className="mx-auto h-7 w-7 text-[#A855F7]" />
                  <p className="mt-3 text-sm text-slate-300">
                    You have not enrolled in any courses yet.
                  </p>
                  <Link
                    to="/courses"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#6D28D9] px-4 py-2 text-xs font-semibold text-white"
                  >
                    Explore All Courses
                  </Link>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {enrollments.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between gap-4 rounded-xl border border-white/10 bg-[#100B20] p-4 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-400">
                          {item.courseCategory} · {item.level} ·{' '}
                          <span className="text-white">
                            {item.status === 'completed' ? 'Completed' : 'In Progress'}
                          </span>
                        </p>
                        <h3 className="mt-1 font-display text-base font-semibold text-white">
                          {item.courseTitle}
                        </h3>
                        <div className="mt-2.5 flex items-center gap-3">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full bg-[#A855F7]"
                              style={{ width: `${item.progressPercent}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs tabular-nums text-[#C084FC]">
                            {item.progressPercent}%
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/courses/${item.courseId}`}
                        className="rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-white hover:border-[#A855F7] whitespace-nowrap shrink-0"
                      >
                        Open Lessons
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Completed Courses & Certificates + Prompt Tool */}
          <div className="lg:col-span-4 space-y-6">
            <section className="rounded-2xl border border-white/10 bg-[#17112B] p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-semibold text-white">
                  Completed &amp; Certificates
                </h2>
                <Link
                  to="/certificates"
                  className="text-xs font-semibold text-[#C084FC] hover:text-white"
                >
                  View All
                </Link>
              </div>

              {certificates.length === 0 ? (
                <p className="mt-4 text-sm leading-relaxed text-slate-400">
                  Complete 100% of a course&apos;s lessons to earn your verified LIWAI ACADEMY
                  certificate.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {certificates.map((cert) => (
                    <Link
                      key={cert.id}
                      to="/certificates"
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#100B20] p-3.5 hover:border-[#A855F7]/60"
                    >
                      <Award className="h-5 w-5 text-[#A855F7] shrink-0" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {cert.courseTitle}
                        </p>
                        <p className="font-mono text-xs text-slate-400">{cert.certificateCode}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-[#6D28D9]/50 bg-[#17112B] p-6">
              <h2 className="font-display text-base font-semibold text-white">
                AI Prompt Generator
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Build custom prompts for your coursework, coding tasks, or content campaigns.
              </p>
              <Link
                to="/prompt-generator"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#6D28D9] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#7C3AED]"
              >
                Open Prompt Lab
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
