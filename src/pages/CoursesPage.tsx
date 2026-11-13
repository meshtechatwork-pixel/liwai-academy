import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import { useAcademy } from '../context/AcademyContext';
import { COURSE_CATEGORIES, COURSE_LEVELS, CourseCategory, CourseLevel } from '../types/academy';

export default function CoursesPage() {
  const { courses, enrollments, loadingCourses } = useAcademy();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCat = searchParams.get('category') || 'All';
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCat);
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const paramCat = searchParams.get('category');
    if (paramCat) setSelectedCategory(paramCat);
  }, [searchParams]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: cat });
    }
  };

  const filtered = courses.filter((course) => {
    if (course.published === false) return false;
    if (selectedCategory !== 'All' && course.category !== (selectedCategory as CourseCategory)) {
      return false;
    }
    if (selectedLevel !== 'All' && course.level !== (selectedLevel as CourseLevel)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        course.title.toLowerCase().includes(q) ||
        course.description.toLowerCase().includes(q) ||
        course.instructor.toLowerCase().includes(q) ||
        course.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-[#100B20] text-white">
      <div className="mx-auto max-w-[1280px] px-6 py-12 lg:py-16">
        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#A855F7]">Course Catalog</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
              All Courses
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Browse structured tracks across all five LIWAI ACADEMY disciplines and three skill
              levels.
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses or instructors..."
              className="w-full rounded-lg border border-white/15 bg-[#17112B] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-[#A855F7] focus:outline-none"
            />
          </div>
        </div>

        {/* Filter Bars */}
        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-[#17112B] p-1.5">
            {['All', ...COURSE_CATEGORIES].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#6D28D9] text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-[#17112B] p-1.5 self-start">
            {['All', ...COURSE_LEVELS].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedLevel(lvl)}
                className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  selectedLevel === lvl
                    ? 'bg-[#A855F7] text-[#100B20] font-semibold'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Course Grid */}
        {loadingCourses ? (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-96 animate-pulse rounded-xl border border-white/10 bg-[#17112B]"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-white/10 bg-[#17112B] p-12 text-center">
            <h2 className="font-display text-lg font-semibold text-white">No matching courses</h2>
            <p className="mt-2 text-sm text-slate-400">
              Try clearing your search filter or switching to another skill level.
            </p>
            <button
              type="button"
              onClick={() => {
                handleCategoryChange('All');
                setSelectedLevel('All');
                setSearchQuery('');
              }}
              className="mt-5 rounded-lg bg-[#6D28D9] px-4 py-2 text-xs font-semibold text-white hover:bg-[#7C3AED]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                enrollment={enrollments.find((e) => e.courseId === course.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
