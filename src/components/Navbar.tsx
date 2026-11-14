import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLearning } from '../hooks/useLearning';

export default function Navbar() {
  const { user, profile, isAdmin, logout } = useAuth();
  const { notifications } = useLearning();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : user?.displayName || 'Student';

  const initials = displayName
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    setMenuOpen(false);
    setMobileOpen(false);
    await logout();
    navigate('/');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap shrink-0 text-sm font-medium transition-colors duration-150 ${
      isActive
        ? 'text-white underline decoration-[#A855F7] decoration-2 underline-offset-8'
        : 'text-slate-300 hover:text-white hover:underline hover:decoration-white/30 hover:underline-offset-8'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#100B20]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1: Single-line Brand Wordmark */}
        <Link
          to="/"
          className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]"
        >
          Learn It With AI
        </Link>

        {/* Zone 2: 5 Concise Single-Line Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7" aria-label="Primary navigation">
          <NavLink to="/courses" className={navLinkClass}>
            Courses
          </NavLink>
          <NavLink to="/prompt-generator" className={navLinkClass}>
            Prompt Lab
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
          <NavLink to="/dashboard" className={navLinkClass}>
            Dashboard
          </NavLink>
          {isAdmin ? (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          ) : (
            <NavLink to="/my-learning" className={navLinkClass}>
              My Learning
            </NavLink>
          )}
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="hidden lg:flex items-center shrink-0 relative">
          {!user ? (
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg bg-[#6D28D9] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#7C3AED] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]"
            >
              Sign In
            </Link>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-2.5 rounded-lg border border-white/15 bg-[#17112B]/90 backdrop-blur-md px-3.5 py-2 text-sm font-medium text-white transition-colors duration-150 hover:border-[#A855F7]/60 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]"
                aria-expanded={menuOpen}
              >
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                    className="h-6 w-6 rounded-md object-cover"
                  />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#6D28D9] text-xs font-semibold text-white">
                    {initials || 'LW'}
                  </span>
                )}
                <span className="max-w-[130px] truncate">{displayName}</span>
                {unreadCount > 0 && (
                  <span className="font-mono text-xs tabular-nums text-[#C084FC]">
                    ({unreadCount})
                  </span>
                )}
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 mt-2 w-60 rounded-xl border border-white/12 bg-[#17112B]/95 backdrop-blur-xl p-1.5 shadow-2xl"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/8 hover:text-white"
                  >
                    <span>Student Dashboard</span>
                    {unreadCount > 0 && (
                      <span className="inline-flex items-center gap-1 font-mono text-xs tabular-nums text-[#C084FC]">
                        <Bell className="h-3.5 w-3.5" />
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/my-learning"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/8 hover:text-white"
                  >
                    My Learning
                  </Link>
                  <Link
                    to="/certificates"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/8 hover:text-white"
                  >
                    Certificates
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/8 hover:text-white"
                  >
                    My Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-[#A855F7] hover:bg-white/8"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <div className="my-1 border-t border-white/10" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-300 hover:bg-rose-500/10"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-[#17112B] text-white lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#17112B]/95 backdrop-blur-xl px-6 py-4 lg:hidden">
          <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/8 hover:text-white"
            >
              Home
            </Link>
            <Link
              to="/courses"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/8 hover:text-white"
            >
              All Courses
            </Link>
            <Link
              to="/prompt-generator"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/8 hover:text-white"
            >
              AI Prompt Generator
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/8 hover:text-white"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/8 hover:text-white"
            >
              Contact Us
            </Link>
            <Link
              to="/faq"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/8 hover:text-white"
            >
              FAQ
            </Link>
            {user ? (
              <>
                <div className="my-1 border-t border-white/10" />
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/8 hover:text-white"
                >
                  Student Dashboard
                </Link>
                <Link
                  to="/my-learning"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/8 hover:text-white"
                >
                  My Learning
                </Link>
                <Link
                  to="/certificates"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/8 hover:text-white"
                >
                  Certificates
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/8 hover:text-white"
                >
                  My Profile
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#A855F7] hover:bg-white/8"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-left text-sm font-medium text-rose-200"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg bg-[#6D28D9] px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg border border-white/15 px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
