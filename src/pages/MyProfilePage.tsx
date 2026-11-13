import React, { useEffect, useState } from 'react';
import { CheckCircle2, Mail, Save, Upload } from 'lucide-react';
import { useAcademy } from '../context/AcademyContext';
import { useAuth } from '../context/AuthContext';
import { COURSE_LEVELS, CourseLevel } from '../types/academy';

export default function MyProfilePage() {
  const { user, profile, updateProfileData, resendVerification, refreshProfile, logout } = useAuth();
  const { courses } = useAcademy();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [countyOrState, setCountyOrState] = useState('');
  const [townOrCity, setTownOrCity] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel>('Beginner');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setPhone(profile.phone || '');
      setCountry(profile.country || '');
      setCountyOrState(profile.countyOrState || '');
      setTownOrCity(profile.townOrCity || '');
      setSelectedCourseId(profile.selectedCourseId || courses[0]?.id || '');
      setSelectedLevel(profile.selectedLevel || 'Beginner');
      setAvatarPreview(profile.avatarUrl || '');
    }
  }, [profile, courses]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    setError(null);
    try {
      await updateProfileData(
        {
          firstName,
          lastName,
          phone,
          country,
          countyOrState,
          townOrCity,
          selectedCourseId,
          selectedLevel,
        },
        avatarFile,
      );
      setAvatarFile(null);
      setStatus('Profile updated successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendVerification();
      setStatus('Verification email sent. Check your inbox and then click Refresh Status.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send verification email.');
    }
  };

  return (
    <div className="bg-[#100B20] text-white">
      <div className="mx-auto max-w-3xl px-6 py-12 lg:py-16">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#A855F7]">Account Settings</p>
            <h1 className="mt-1 font-display text-3xl font-bold text-white">My Profile</h1>
          </div>
          <button
            type="button"
            onClick={logout}
            className="self-start rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/20"
          >
            Sign Out
          </button>
        </div>

        {/* Email Verification Status */}
        {user && !user.emailVerified && (
          <div className="mt-6 flex flex-col justify-between gap-3 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 text-xs text-amber-100">
              <Mail className="h-4 w-4 text-amber-300 shrink-0" />
              <span>Your email address ({user.email}) is not yet verified.</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleResend}
                className="rounded-lg border border-amber-300/40 px-3 py-1.5 text-xs font-semibold text-amber-100 hover:bg-amber-400/20"
              >
                Resend Verification
              </button>
              <button
                type="button"
                onClick={refreshProfile}
                className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-black"
              >
                Refresh Status
              </button>
            </div>
          </div>
        )}

        {status && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{status}</span>
          </div>
        )}
        {error && (
          <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-200">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-6 rounded-2xl border border-white/10 bg-[#17112B] p-6 sm:p-8"
        >
          <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#100B20] p-4 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-[#17112B]">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile avatar"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-display text-lg font-bold text-[#A855F7]">
                  {(firstName[0] || 'L') + (lastName[0] || 'A')}
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">
                {firstName} {lastName}
              </p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/15 bg-[#17112B] px-4 py-2 text-xs font-semibold text-white hover:border-[#A855F7]">
              <Upload className="h-3.5 w-3.5" />
              Update Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-300" htmlFor="prof-first">
                First Name
              </label>
              <input
                id="prof-first"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white focus:border-[#A855F7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300" htmlFor="prof-last">
                Last Name
              </label>
              <input
                id="prof-last"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white focus:border-[#A855F7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300" htmlFor="prof-phone">
                Phone Number
              </label>
              <input
                id="prof-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white focus:border-[#A855F7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300" htmlFor="prof-country">
                Country
              </label>
              <input
                id="prof-country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white focus:border-[#A855F7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300" htmlFor="prof-state">
                County or State
              </label>
              <input
                id="prof-state"
                type="text"
                value={countyOrState}
                onChange={(e) => setCountyOrState(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white focus:border-[#A855F7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300" htmlFor="prof-city">
                Town or City
              </label>
              <input
                id="prof-city"
                type="text"
                value={townOrCity}
                onChange={(e) => setTownOrCity(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white focus:border-[#A855F7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300" htmlFor="prof-course">
                Primary Course Track
              </label>
              <select
                id="prof-course"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-[#100B20] px-3.5 py-2.5 text-sm text-white focus:border-[#A855F7] focus:outline-none"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300" htmlFor="prof-level">
                Skill Level
              </label>
              <select
                id="prof-level"
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
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-[#6D28D9] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#7C3AED] disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
