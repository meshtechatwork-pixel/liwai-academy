import { useState } from 'react';
import { Link } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import { useLearning } from '../hooks/useLearning';

export default function MyLearningPage() {
  const { courses, enrollments, progressList } = useLearning();
  const [tab, setTab] = useState<'all' | 'in_progress' | 'completed'>('all');

  const enrolledCoursePairs = enrollments
    .map((enr) => ({
      enrollment: enr,
      progress: progressList.find((p) => p.courseId === enr.courseId),
      course: courses.find((c) => c.id === enr.courseId),
    }))
    .filter(
      (
        pair,
      ): pair is {
        enrollment: (typeof enrollments)[0];
        progress: (typeof progressList)[0] | undefined;
        course: NonNullable<typeof pair.course>;
      } => Boolean(pair.course),
    );

  const isPairCompleted = (pair: (typeof enrolledCoursePairs)[0]) =>
    pair.progress?.status === 'completed' || pair.enrollment.status === 'completed';

  const visible = enrolledCoursePairs.filter((pair) => {
    const done = isPairCompleted(pair);
    if (tab === 'in_progress') return !done;
    if (tab === 'completed') return done;
    return true;
  });

  const completedCount = enrolledCoursePairs.filter(isPairCompleted).length;
  const inProgressCount = enrolledCoursePairs.length - completedCount;

  return (
    <div className="bg-[#100B20] text-white">
      <div className="mx-auto max-w-[1280px] px-6 py-12 lg:py-16">
        <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#A855F7]">Learner Workspace</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-white">My Learning</h1>
            <p className="mt-2 text-sm text-slate-300">
              Track active courses, lesson completion progress, and finished curricula on Learn It
              With AI.
            </p>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-1.5 self-start">
            {(
              [
                { id: 'all', label: `All (${enrolledCoursePairs.length})` },
                { id: 'in_progress', label: `In Progress (${inProgressCount})` },
                { id: 'completed', label: `Completed (${completedCount})` },
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
        </div>

        {visible.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-12 text-center">
            <h2 className="font-display text-lg font-semibold text-white">
              {tab === 'completed'
                ? 'No completed courses yet'
                : 'No active course enrollments'}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Enroll in any course from our five learning categories to start tracking progress.
            </p>
            <Link
              to="/courses"
              className="mt-6 inline-flex items-center rounded-lg bg-[#6D28D9] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7C3AED]"
            >
              Explore Courses
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visible.map(({ course, enrollment, progress }) => (
              <CourseCard
                key={course.id}
                course={course}
                enrollment={enrollment}
                progress={progress}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
