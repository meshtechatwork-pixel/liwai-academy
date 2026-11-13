import { Link } from 'react-router-dom';
import { ArrowRight, Award, BookOpen, Compass, Layers } from 'lucide-react';
import { HERO_IMAGE } from '../data/sampleCourses';
import { COURSE_CATEGORIES } from '../types/academy';

export default function AboutPage() {
  return (
    <div className="bg-[#100B20] text-white">
      <div className="mx-auto max-w-[1280px] px-6 py-14 lg:py-20">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-wide text-[#A855F7]">
            About LIWAI ACADEMY · Learn It With AI
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-5xl text-balance">
            Practical digital education engineered for the AI era.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-slate-300">
            LIWAI ACADEMY trains designers, full-stack developers, social strategists, video
            editors, and prompt architects to work alongside modern AI systems without sacrificing
            craft, verification, or fundamentals.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-[#17112B]">
          <img
            src={HERO_IMAGE}
            alt="LIWAI ACADEMY studio environment"
            referrerPolicy="no-referrer"
            className="h-[340px] w-full object-cover sm:h-[420px]"
          />
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-[#17112B] p-6">
            <BookOpen className="h-6 w-6 text-[#A855F7]" />
            <h2 className="mt-4 font-display text-lg font-semibold text-white">
              01. Structured Mastery Tiers
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Every discipline is segmented into Beginner, Intermediate, and Advanced levels so
              learners start at the right depth and advance with clear milestones.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#17112B] p-6">
            <Compass className="h-6 w-6 text-[#A855F7]" />
            <h2 className="mt-4 font-display text-lg font-semibold text-white">
              02. Applied AI Workflows
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Our integrated AI Prompt Generator helps students translate course frameworks into
              structured prompts for real design, code, content, and editing tasks.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#17112B] p-6">
            <Award className="h-6 w-6 text-[#A855F7]" />
            <h2 className="mt-4 font-display text-lg font-semibold text-white">
              03. Verified Certification
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Completing a course curriculum unlocks an official, verifiable LIWAI ACADEMY
              certificate with unique credential tracking.
            </p>
          </div>
        </div>

        <div className="mt-14 rounded-2xl border border-white/10 bg-[#17112B] p-8 sm:p-10">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#A855F7]">
                <Layers className="h-4 w-4" />
                <span>Five Core Disciplines</span>
              </div>
              <h2 className="mt-2 font-display text-2xl font-bold text-white">
                One unified platform from concept to production
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Explore {COURSE_CATEGORIES.join(', ')}—each paired with guided video modules and
                downloadable reference workbooks.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-lg bg-[#6D28D9] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7C3AED]"
              >
                Explore Courses
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/5"
              >
                Register Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
