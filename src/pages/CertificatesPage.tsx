import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, CheckCircle2, Eye, Search, ShieldCheck } from 'lucide-react';
import CertificateModal from '../components/CertificateModal';
import { useLearning } from '../hooks/useLearning';
import { Certificate, CertificateVerification } from '../types/learning';

export default function CertificatesPage() {
  const { certificates, enrollments, progressList, verifyCertificateCode } = useLearning();
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const [verifyInput, setVerifyInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyChecked, setVerifyChecked] = useState(false);
  const [verifiedResult, setVerifiedResult] = useState<CertificateVerification | null>(null);

  const getProgressPercent = (courseId: string) =>
    progressList.find((p) => p.courseId === courseId)?.progressPercent ?? 0;

  const isCompleted = (courseId: string) => {
    const enr = enrollments.find((e) => e.courseId === courseId);
    const prog = progressList.find((p) => p.courseId === courseId);
    return prog?.status === 'completed' || enr?.status === 'completed';
  };

  const inProgress = enrollments.filter((e) => !isCompleted(e.courseId));

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyInput.trim()) return;
    setVerifying(true);
    setVerifyChecked(false);
    try {
      const result = await verifyCertificateCode(verifyInput);
      setVerifiedResult(result);
      setVerifyChecked(true);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="bg-[#100B20] text-white">
      <div className="mx-auto max-w-[1280px] px-6 py-12 lg:py-16">
        <div className="border-b border-white/10 pb-8">
          <p className="text-xs font-semibold tracking-wide text-[#A855F7]">
            Verified Credentials
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white">Certificates</h1>
          <p className="mt-2 text-sm text-slate-300">
            View, print, download, and verify official Learn It With AI completion certificates.
          </p>
        </div>

        {/* Certificate Verification Lookup */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#C084FC]">
                <ShieldCheck className="h-4 w-4" />
                <span>Certificate Verification</span>
              </div>
              <h2 className="mt-1 font-display text-lg font-semibold text-white">
                Verify an official Learn It With AI credential ID
              </h2>
            </div>

            <form onSubmit={handleVerify} className="flex w-full gap-2 lg:w-auto">
              <div className="relative flex-1 lg:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={verifyInput}
                  onChange={(e) => setVerifyInput(e.target.value)}
                  placeholder="e.g. LWAI-WEB--ABC123"
                  className="w-full rounded-lg border border-white/15 bg-[#100B20] py-2.5 pl-9 pr-3 font-mono text-xs text-white placeholder:text-slate-500 focus:border-[#A855F7] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={verifying}
                className="rounded-lg bg-[#6D28D9] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#7C3AED] disabled:opacity-60 whitespace-nowrap shrink-0"
              >
                {verifying ? 'Checking...' : 'Verify Code'}
              </button>
            </form>
          </div>

          {verifyChecked && (
            <div className="mt-4">
              {verifiedResult && verifiedResult.valid ? (
                <div className="flex flex-col justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-100 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                    <div>
                      <p className="font-semibold text-white">
                        Valid Certificate · {verifiedResult.certificateCode}
                      </p>
                      <p className="mt-0.5 text-emerald-200">
                        Awarded to {verifiedResult.studentName} for completing{' '}
                        {verifiedResult.courseTitle} ({verifiedResult.level})
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-emerald-300 shrink-0">
                    Issued by {verifiedResult.issuedBy}
                  </span>
                </div>
              ) : (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-200">
                  No active certificate was found matching &ldquo;{verifyInput.trim()}&rdquo;. Check
                  the code and try again.
                </div>
              )}
            </div>
          )}
        </section>

        {/* Earned Certificates */}
        {certificates.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-12 text-center">
            <Award className="mx-auto h-10 w-10 text-[#A855F7]" />
            <h2 className="mt-4 font-display text-lg font-semibold text-white">
              No certificates issued yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
              Finish all lessons in any enrolled course to unlock an official completion
              certificate automatically, or receive one issued by an instructor.
            </p>
            <Link
              to="/courses"
              className="mt-6 inline-flex items-center rounded-lg bg-[#6D28D9] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#7C3AED]"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="flex flex-col justify-between rounded-2xl border border-[#6D28D9]/50 bg-[#17112B]/85 backdrop-blur-md p-6"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-[#C084FC]">
                      {cert.courseCategory} · {cert.level}
                    </span>
                    <span className="font-mono">{cert.certificateCode}</span>
                  </div>
                  <h2 className="mt-3 font-display text-xl font-bold text-white">
                    {cert.courseTitle}
                  </h2>
                  <p className="mt-2 text-sm text-slate-300">
                    Awarded to <span className="font-semibold text-white">{cert.studentName}</span>
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-xs text-slate-400">
                    Issued by {cert.issuedBy || 'Learn It With AI'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCert(cert)}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#6D28D9] px-4 py-2 text-xs font-semibold text-white hover:bg-[#7C3AED]"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View &amp; Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {inProgress.length > 0 && (
          <div className="mt-12 rounded-2xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-6">
            <h2 className="font-display text-base font-semibold text-white">
              Courses In Progress Toward Certification
            </h2>
            <div className="mt-4 space-y-3">
              {inProgress.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-white/10 bg-[#100B20] p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{item.courseTitle}</p>
                    <p className="mt-0.5 text-xs tabular-nums text-slate-400">
                      {getProgressPercent(item.courseId)}% completed
                    </p>
                  </div>
                  <Link
                    to={`/courses/${item.courseId}`}
                    className="self-start rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-white hover:border-[#A855F7] sm:self-auto"
                  >
                    Continue Course
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedCert && (
        <CertificateModal certificate={selectedCert} onClose={() => setSelectedCert(null)} />
      )}
    </div>
  );
}
