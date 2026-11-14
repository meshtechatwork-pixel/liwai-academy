import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { DEFAULT_FAQS } from '../data/sampleCourses';

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="bg-[#100B20] text-white">
      <div className="mx-auto max-w-4xl px-6 py-12 lg:py-16">
        <div className="border-b border-white/10 pb-8">
          <p className="text-xs font-semibold tracking-wide text-[#A855F7]">
            Learn It With AI · Help Center
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-sm text-slate-300">
            Answers about courses, skill levels, the AI Prompt Generator, and verified certificates.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {DEFAULT_FAQS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.question}
                className="rounded-xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-display text-base font-semibold text-white">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[#A855F7] transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-white/8 px-6 pb-5 pt-4 text-sm leading-relaxed text-slate-300">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-base font-semibold text-white">Still have questions?</h2>
            <p className="mt-1 text-xs text-slate-400">
              Reach out to our team for personalized guidance on course tracks.
            </p>
          </div>
          <Link
            to="/contact"
            className="rounded-lg bg-[#6D28D9] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#7C3AED] whitespace-nowrap shrink-0"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
