import { Link } from 'react-router-dom';
import { useLearning } from '../hooks/useLearning';

export default function Footer() {
  const { categories, siteContent } = useLearning();
  const activeCategories = categories.filter((c) => c.active !== false);

  return (
    <footer className="border-t border-white/10 bg-[#0C0818]">
      <div className="mx-auto max-w-[1280px] px-6 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="font-display text-lg font-bold tracking-tight text-white">
              Learn It With AI
            </Link>
            <p className="mt-2 text-sm font-medium text-[#A855F7]">Learn It With AI</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
              Practical digital education combining modern design systems, full-stack web
              engineering, social media growth, video editing, and structured AI prompting.
            </p>
            <p className="mt-4 text-xs text-slate-500">
              {siteContent.contactEmail} · {siteContent.contactPhone}
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-white">Curriculum</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              {activeCategories.map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/courses?category=${encodeURIComponent(category.name)}`}
                    className="transition-colors hover:text-white"
                  >
                    {category.name}
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
                <Link to="/contact" className="transition-colors hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="transition-colors hover:text-white">
                  FAQ
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
                <Link to="/login" className="transition-colors hover:text-white">
                  Student Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="transition-colors hover:text-white">
                  Student Registration
                </Link>
              </li>
              <li>
                <Link to="/admin" className="transition-colors hover:text-white">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Learn It With AI. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/privacy" className="transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/terms" className="transition-colors hover:text-white">
              Terms and Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
