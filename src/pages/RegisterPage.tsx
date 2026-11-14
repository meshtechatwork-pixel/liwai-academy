import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLearning } from '../hooks/useLearning';
import { COURSE_LEVELS, CourseLevel } from '../types/learning';

export default function RegisterPage() {
  const { registerWithEmail, loginWithGoogle } = useAuth();
  const { courses, enrollInCourse } = useLearning();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [countyOrState, setCountyOrState] = useState('');
  const [townOrCity, setTownOrCity] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(
    courses[0]?.id || 'web-design-systems',
  );
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel>('Beginner');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file for your profile picture.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Profile picture must be under 5 MB.');
      return;
    }
    setError(null);
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const validate = (): string | null => {
    if (!firstName.trim() || !lastName.trim()) return 'First name and last name are required.';
    if (!/^[+\d\s()-]{7,25}$/.test(phone.trim())) {
      return 'Please enter a valid phone number (at least 7 digits).';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return 'Please enter a valid email address.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    if (password !== confirmPassword) {
      return 'Password and Confirm Password do not match.';
    }
    if (!country.trim() || !countyOrState.trim() || !townOrCity.trim()) {
      return 'Country, County/State, and Town/City are required.';
    }
    if (!selectedCourseId) return 'Please select a starting course.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await registerWithEmail({
        firstName,
        lastName,
        phone,
        email,
        password,
        country,
        countyOrState,
        townOrCity,
        selectedCourseId,
        selectedLevel,
        avatarFile,
      });

      const chosenCourse = courses.find((c) => c.id === selectedCourseId);
      if (chosenCourse) {
        try {
          await enrollInCourse(chosenCourse);
        } catch {
          // Enrollment will also be available from dashboard
        }
      }

      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('auth/operation-not-allowed')) {
        setError(
          'Email/Password sign-up is not yet enabled in Firebase Console (Authentication > Sign-in method). Enable Email/Password there, or register instantly using Continue with Google below.',
        );
      } else if (msg.includes('auth/email-already-in-use')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#100B20] px-6 py-12 text-white lg:py-16">
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#17112B]/85 backdrop-blur-md p-6 sm:p-10">
        <div className="border-b border-white/10 pb-6">
          <p className="text-xs font-semibold tracking-wide text-[#A855F7]">
            Learn It With AI · Student Enrollment
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
            Create Your Student Account
          </h1>
          <p className="mt-1.5 text-sm text-slate-300">
            Complete your learner profile, choose your starting course and learning level, and
            access your personalized dashboard.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs leading-relaxed text-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Profile Picture Upload */}
          <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#100B20] p-4 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-[#17112B]">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-display text-lg font-bold text-[#A855F7]">LW</span>
              )}
            </div>
            <div className="flex-1">
              <label htmlFor="reg-avatar" className="block text-xs font-semibold text-white">
                Profile Picture (optional)
              </label>
              <p className="mt-0.5 text-xs text-slate-400">
                PNG or JPG up to 5 MB. Stored securely for your student profile and certificates.
              </p>
            </div>
            <label
              htmlFor="reg-avatar"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/15 bg-[#17112B] px-4 py-2 text-xs font-semibold text-white hover:border-[#A855F7]"
            >
              <Upload className="h-3.5 w-3.5" />
              {avatarFile ? 'Change Photo' : 'Upload Photo'}
              <input
                id="reg-avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="sr-only"
              />
            </label>
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="reg-first" className="block text-xs font-medium text-slate-300">
                First Name
              </label>
              <input
                id="reg-first"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Amara"
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#A855F7] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="reg-last" className="block text-xs font-medium text-slate-300">
                Last Name
              </label>
              <input
                id="reg-last"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Okafor"
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#A855F7] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="reg-phone" className="block text-xs font-medium text-slate-300">
                Phone Number
              </label>
              <input
                id="reg-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254 712 345 678"
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#A855F7] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-xs font-medium text-slate-300">
                Email Address
              </label>
              <input
                id="reg-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#A855F7] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-xs font-medium text-slate-300">
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#A855F7] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="reg-confirm" className="block text-xs font-medium text-slate-300">
                Confirm Password
              </label>
              <input
                id="reg-confirm"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#A855F7] focus:outline-none"
              />
            </div>
          </div>

          {/* Location Fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="reg-country" className="block text-xs font-medium text-slate-300">
                Country
              </label>
              <input
                id="reg-country"
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Kenya"
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#A855F7] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="reg-state" className="block text-xs font-medium text-slate-300">
                County or State
              </label>
              <input
                id="reg-state"
                type="text"
                required
                value={countyOrState}
                onChange={(e) => setCountyOrState(e.target.value)}
                placeholder="Nairobi County"
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#A855F7] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="reg-city" className="block text-xs font-medium text-slate-300">
                Town or City
              </label>
              <input
                id="reg-city"
                type="text"
                required
                value={townOrCity}
                onChange={(e) => setTownOrCity(e.target.value)}
                placeholder="Nairobi"
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#A855F7] focus:outline-none"
              />
            </div>
          </div>

          {/* Course & Level Selection */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="reg-course" className="block text-xs font-medium text-slate-300">
                Course Selection
              </label>
              <select
                id="reg-course"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white focus:border-[#A855F7] focus:outline-none"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title} ({course.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="reg-level" className="block text-xs font-medium text-slate-300">
                Learning Level
              </label>
              <select
                id="reg-level"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as CourseLevel)}
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white focus:border-[#A855F7] focus:outline-none"
              >
                {COURSE_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#6D28D9] px-6 py-3 text-sm font-semibold text-white hover:bg-[#7C3AED] disabled:opacity-60"
          >
            <UserPlus className="h-4 w-4" />
            {loading ? 'Creating Account...' : 'Complete Registration'}
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
          onClick={handleGoogleSignUp}
          className="w-full rounded-lg border border-white/15 bg-[#100B20] px-5 py-2.5 text-sm font-semibold text-white hover:border-[#A855F7]/60"
        >
          Continue with Google
        </button>

        <p className="mt-6 text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-[#C084FC] hover:text-white">
            Sign in to your account
          </Link>
        </p>
      </div>
    </div>
  );
}
