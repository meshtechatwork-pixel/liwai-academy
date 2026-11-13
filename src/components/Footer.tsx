import { Link } from 'react-router-dom';
import { COURSE_CATEGORIES } from '../types/academy';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0C0818]">
      <div className="mx-auto max-w-[1280px] px-6 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link to="/" className="font-display text-lg font-bold tracking-tight text-white">
              LIWAI ACADEMY
            </Link>
            <p className="mt-2 text-sm font-medium text-[#A855F7]">Learn It With AI</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Practical creative technology education combining design systems, full-stack
              engineering, media production, and structured AI workflows.
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-white">Curriculum</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              {COURSE_CATEGORIES.map((category) => (
                <li key={category}>
                  <Link
                    to={`/courses?category=${encodeURIComponent(category)}`}
                    className="transition-colors hover:text-white"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-white">Platform</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/courses" className="transition-colors hover:text-white">
                  All Courses
                </Link>
              </li>
              <li>
                <Link to="/prompt-generator" className="transition-colors hover:text-white">
                  AI Prompt Generator
                </Link>
              </li>
              <li>
                <Link to="/about" className="transition-colors hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/register" className="transition-colors hover:text-white">
                  Student Registration
                </Link>
              </li>
              <li>
                <Link to="/login" className="transition-colors hover:text-white">
                  Student Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-white">Learner Portal</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/dashboard" className="transition-colors hover:text-white">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link to="/my-learning" className="transition-colors hover:text-white">
                  My Learning
                </Link>
              </li>
              <li>
                <Link to="/certificates" className="transition-colors hover:text-white">
                  Certificates
                </Link>
              </li>
              <li>
                <Link to="/profile" className="transition-colors hover:text-white">
                  My Profile
                </Link>
              </li>
              <li>
                <Link to="/admin" className="transition-colors hover:text-white">
                  Admin Console
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} LIWAI ACADEMY. All rights reserved.</p>
          <p>Learn It With AI — Creative Technology & AI Curriculum</p>
        </div>
      </div>
    </footer>
  );
}
