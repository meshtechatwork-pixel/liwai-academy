import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { CATEGORY_IMAGES } from '../data/sampleCourses';
import { Course, Enrollment } from '../types/academy';

interface CourseCardProps {
  course: Course;
  enrollment?: Enrollment;
}

export default function CourseCard({ course, enrollment }: CourseCardProps) {
  const [imgError, setImgError] = useState(false);
  const resolvedImg = course.thumbnailUrl || CATEGORY_IMAGES[course.category] || '';

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#17112B] transition-colors duration-150 hover:border-[#A855F7]/50">
      <Link to={`/courses/${course.id}`} className="relative aspect-[4/3] w-full overflow-hidden bg-[#1D1536]">
        {!imgError && resolvedImg ? (
          <img
            src={resolvedImg}
            alt={course.title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#1E143B] via-[#17112B] to-[#100B20] p-6 text-center">
            <BookOpen className="mb-3 h-8 w-8 text-[#A855F7]" />
            <span className="text-xs font-medium text-slate-300">{course.category}</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="font-medium text-[#C084FC]">{course.category}</span>
          <span aria-hidden="true">·</span>
          <span>{course.level}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{course.lessonCount} Lessons</span>
        </div>

        <Link to={`/courses/${course.id}`} className="mt-3 block">
          <h3 className="font-display text-lg font-semibold leading-snug text-white transition-colors group-hover:text-[#C084FC]">
            {course.title}
          </h3>
        </Link>

        <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-slate-300">
          {course.description}
        </p>

        {enrollment && (
          <div className="mt-4 pt-3 border-t border-white/8">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">
                {enrollment.status === 'completed' ? 'Completed' : 'In Progress'}
              </span>
              <span className="font-mono tabular-nums text-[#C084FC]">
                {enrollment.progressPercent}%
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-[#A855F7] transition-all duration-300"
                style={{ width: `${enrollment.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-auto pt-5 flex items-center justify-between border-t border-white/8 text-xs text-slate-400">
          <span>
            {course.instructor} · <span className="tabular-nums">{course.duration}</span>
          </span>
          <Link
            to={`/courses/${course.id}`}
            className="inline-flex items-center gap-1.5 font-semibold text-white transition-colors hover:text-[#A855F7] whitespace-nowrap shrink-0"
          >
            {enrollment ? 'Continue' : 'View Course'}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
