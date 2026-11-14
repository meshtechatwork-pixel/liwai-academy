import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { loginWithEmail, loginWithGoogle, sendPasswordReset } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const formatAuthError = (err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('auth/operation-not-allowed')) {
      return 'Email/Password sign-in is not yet enabled in Firebase Authentication Console. Enable "Email/Password" under Authentication > Sign-in method, or use Continue with Google below.';
    }
    if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
      return 'Invalid email address or password. Please verify your credentials.';
    }
    return msg;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!email.trim() || !password) {
      setError('Please enter your email address and password.');
      return;
    }

    setLoading(true);
    try {
      await loginWithEmail(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!email.trim()) {
      setError('Enter your email address above first to receive a password reset link.');
      return;
    }
    setError(null);
    try {
      await sendPasswordReset(email);
      setInfo('Password reset email sent. Check your inbox.');
    } catch (err) {
      setError(formatAuthError(err));
    }
  };

  return (
    <div className="bg-[#100B20] px-6 py-16 text-white">
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-[#17112B]/85 backdrop-blur-md p-8">
        <p className="text-xs font-semibold tracking-wide text-[#A855F7]">Learn It With AI</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-white">Student &amp; Admin Login</h1>
        <p className="mt-1.5 text-sm text-slate-300">
          Sign in to resume your courses, generate prompts, and view certificates.
        </p>

        {error && (
          <div className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs leading-relaxed text-rose-200">
            {error}
          </div>
        )}
        {info && (
          <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-200">
            {info}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-medium text-slate-300">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#A855F7] focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="block text-xs font-medium text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-[#C084FC] hover:text-white"
              >
                Forgot password?
              </button>
            </div>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#A855F7] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#6D28D9] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7C3AED] disabled:opacity-60"
          >
            <LogIn className="h-4 w-4" />
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-slate-500">
          <div className="h-px flex-1 bg-white/10" />
          <span>or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleGoogle}
          className="w-full rounded-lg border border-white/15 bg-[#100B20] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-[#A855F7]/60"
        >
          Continue with Google
        </button>

        <p className="mt-6 text-center text-xs text-slate-400">
          New to Learn It With AI?{' '}
          <Link to="/register" className="font-semibold text-[#C084FC] hover:text-white">
            Create a student account
          </Link>
        </p>
      </div>
    </div>
  );
}
