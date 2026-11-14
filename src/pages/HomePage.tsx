import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, BookOpen, Compass, Cpu, Film, Layout, Share2 } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';
import { CATEGORY_IMAGES, HERO_IMAGE } from '../data/sampleCourses';
import { useLearning } from '../hooks/useLearning';

const CATEGORY_ICONS: Record<string, typeof Layout> = {
  'Web Design': Layout,
  'Web Development': Cpu,
  'Social Media Management': Share2,
  'Video Editing': Film,
  'AI Prompt Generator': Compass,
};

export default function HomePage() {
  const { courses, categories, enrollments, progressList, siteContent } = useLearning();
  const { user } = useAuth();
  const [heroImgError, setHeroImgError] = useState(false);

  const publishedCourses = courses.filter((c) => c.published !== false);
  const featuredCourses = publishedCourses.slice(0, 3);
  const activeCategories = categories.filter((c) => c.active !== false);

  return (
    <div className="bg-[#100B20] text-white">
      {/* Announcement Strip */}
      {siteContent.announcement && (
        <div className="border-b border-white/10 bg-[#17112B]/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-6 py-2.5 text-xs text-slate-300">
            <p className="truncate">{siteContent.announcement}</p>
            <Link
              to="/courses"
              className="font-semibold text-[#C084FC] hover:text-white whitespace-nowrap shrink-0"
            >
              Explore Tracks →
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="mx-auto max-w-[1280px] px-6 pt-12 pb-16 lg:pt-16 lg:pb-20">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
          <div className="flex flex-col justify-center lg:col-span-6">
            <p className="text-sm font-semibold tracking-wide text-[#A855F7]">
              Learn It With AI
            </p>
            <h1 className="mt-4 font-display text-[clamp(2.25rem,4vw,3.75rem)] font-bold leading-[1.08] tracking-tight text-white text-balance">
              {siteContent.heroHeadline}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300">
              {siteContent.heroSubtext}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to={user ? '/dashboard' : '/register'}
                className="inline-flex items-center gap-2 rounded-lg bg-[#6D28D9] px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#7C3AED] whitespace-nowrap shrink-0"
              >
                {user ? 'Go to Dashboard' : 'Start Learning Today'}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#17112B]/80 backdrop-blur-md px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:border-[#A855F7]/60 whitespace-nowrap shrink-0"
              >
                Browse Curriculum
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative h-full min-h-[280px] overflow-hidden rounded-2xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md">
              {!heroImgError ? (
                <img
                  src={HERO_IMAGE}
                  alt="Learn It With AI studio workspace"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[320px] flex-col items-center justify-center bg-gradient-to-br from-[#231546] via-[#17112B] to-[#100B20] p-10 text-center">
                  <BookOpen className="h-12 w-12 text-[#A855F7]" />
                  <p className="mt-4 font-display text-xl font-bold text-white">
                    Learn It With AI
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    Structured Creative Technology Curriculum
                  </p>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#100B20]/85 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-xs text-slate-200">
                <span>Learn It With AI · {activeCategories.length} Core Disciplines</span>
                <span className="font-mono tabular-nums text-[#C084FC]">
                  Beginner → Advanced
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Outcomes Strip */}
        <div className="mt-12 grid grid-cols-2 gap-4 border-t border-white/10 pt-8 lg:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-5">
            <p className="font-display text-2xl font-bold tabular-nums text-white">
              {activeCategories.length} Tracks
            </p>
            <p className="mt-1 text-xs text-slate-400">Industry-aligned learning disciplines</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-5">
            <p className="font-display text-2xl font-bold tabular-nums text-white">3 Levels</p>
            <p className="mt-1 text-xs text-slate-400">Beginner, Intermediate &amp; Advanced tiers</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-5">
            <p className="font-display text-2xl font-bold tabular-nums text-white">24/7 Lab</p>
            <p className="mt-1 text-xs text-slate-400">Integrated Gemini AI Prompt Generator</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-5">
            <p className="font-display text-2xl font-bold tabular-nums text-white">Verified</p>
            <p className="mt-1 text-xs text-slate-400">Printable &amp; verifiable certificates</p>
          </div>
        </div>
      </section>

      {/* Core Learning Categories */}
      <section className="border-t border-white/10 bg-[#130D26]">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold tracking-wide text-[#A855F7]">
                Curriculum Categories
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl text-balance">
                Five disciplines built for modern creators and engineers
              </h2>
            </div>
            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C084FC] hover:text-white whitespace-nowrap shrink-0"
            >
              Explore all courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {activeCategories.map((cat, index) => {
              const Icon = CATEGORY_ICONS[cat.name] || Layout;
              const count = publishedCourses.filter((c) => c.category === cat.name).length;
              const thumb = CATEGORY_IMAGES[cat.name] || HERO_IMAGE;
              return (
                <Link
                  key={cat.id}
                  to={`/courses?category=${encodeURIComponent(cat.name)}`}
                  className="group flex flex-col justify-between rounded-xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-6 transition-all duration-200 hover:border-[#A855F7]/60"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs tabular-nums text-slate-400">
                        0{index + 1}
                      </span>
                      <Icon className="h-5 w-5 text-[#A855F7]" />
                    </div>
                    <div className="mt-4 aspect-[16/9] overflow-hidden rounded-lg bg-[#100B20]">
                      <img
                        src={thumb}
                        alt={cat.name}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                    <h3 className="mt-5 font-display text-lg font-semibold text-white group-hover:text-[#C084FC]">
                      {cat.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">{cat.description}</p>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4 text-xs text-slate-400">
                    <span className="tabular-nums">
                      {count} active course{count === 1 ? '' : 's'}
                    </span>
                    <span className="font-semibold text-white group-hover:text-[#A855F7]">
                      View track →
                    </span>
                  </div>
                </Link>
              );
            })}

            {/* AI Prompt Lab Spotlight Card */}
            <Link
              to="/prompt-generator"
              className="group flex flex-col justify-between rounded-xl border border-[#6D28D9]/50 bg-gradient-to-br from-[#231447]/90 to-[#17112B]/90 backdrop-blur-md p-6 transition-all duration-200 hover:border-[#A855F7]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#C084FC]">Interactive Tool</span>
                  <Award className="h-5 w-5 text-[#A855F7]" />
                </div>
                <h3 className="mt-6 font-display text-2xl font-bold text-white">
                  AI Prompt Generator Lab
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-200">
                  Select your target AI platform (ChatGPT, Google Gemini, Claude, Copilot),
                  category, purpose, tone, format, and detail level to generate copy-ready prompts.
                </p>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white group-hover:text-[#C084FC]">
                Launch Prompt Generator
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold tracking-wide text-[#A855F7]">Featured Courses</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
                Start with structured video lessons and workbooks
              </h2>
            </div>
            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C084FC] hover:text-white whitespace-nowrap shrink-0"
            >
              All courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                enrollment={enrollments.find((e) => e.courseId === course.id)}
                progress={progressList.find((p) => p.courseId === course.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Student Outcomes & Call to Action */}
      <section className="border-t border-white/10 bg-[#130D26]">
        <div className="mx-auto max-w-[1280px] px-6 py-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold tracking-wide text-[#A855F7]">
                Verified Learner Outcomes
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl text-balance">
                Every course ends with measurable output and certification
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <blockquote className="rounded-xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-5">
                  <p className="text-sm leading-relaxed text-slate-200">
                    &ldquo;Before Learn It With AI I spent hours rewriting UI prompts. The Web
                    Design and Prompt Engineering tracks cut my wireframe turnaround from 3 days to
                    4 hours.&rdquo;
                  </p>
                  <footer className="mt-4 text-xs text-slate-400">
                    <span className="font-semibold text-white">Kofi Mensah</span> · Product
                    Designer, Accra
                  </footer>
                </blockquote>
                <blockquote className="rounded-xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-5">
                  <p className="text-sm leading-relaxed text-slate-200">
                    &ldquo;The React &amp; Firebase track gave me real Firestore security rules and
                    a deployed client portal I used to land my first full-stack contract.&rdquo;
                  </p>
                  <footer className="mt-4 text-xs text-slate-400">
                    <span className="font-semibold text-white">Sarah Wanjiku</span> · Web
                    Developer, Nairobi
                  </footer>
                </blockquote>
              </div>
            </div>

            <div className="rounded-2xl border border-[#6D28D9]/50 bg-[#17112B]/85 backdrop-blur-md p-8 lg:col-span-5">
              <h3 className="font-display text-xl font-bold text-white">
                Ready to begin your track?
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
                Create your student profile, select your starting course and skill level, and track
                every completed lesson toward your certificate.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={user ? '/my-learning' : '/register'}
                  className="inline-flex items-center justify-center rounded-lg bg-[#6D28D9] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7C3AED]"
                >
                  {user ? 'Open My Learning' : 'Create Student Account'}
                </Link>
                <Link
                  to="/prompt-generator"
                  className="inline-flex items-center justify-center rounded-lg border border-white/15 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/5"
                >
                  Try Prompt Lab
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
