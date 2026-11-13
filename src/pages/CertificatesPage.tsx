import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Eye } from 'lucide-react';
import CertificateModal from '../components/CertificateModal';
import { useAcademy } from '../context/AcademyContext';
import { Certificate } from '../types/academy';

export default function CertificatesPage() {
  const { certificates, enrollments } = useAcademy();
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const inProgress = enrollments.filter((e) => e.status !== 'completed');

  return (
    <div className="bg-[#100B20] text-white">
      <div className="mx-auto max-w-[1280px] px-6 py-12 lg:py-16">
        <div className="border-b border-white/10 pb-8">
          <p className="text-xs font-semibold tracking-wide text-[#A855F7]">Verified Credentials</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white">Certificates</h1>
          <p className="mt-2 text-sm text-slate-300">
            View, print, and download your official LIWAI ACADEMY completion certificates.
          </p>
        </div>

        {certificates.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-[#17112B] p-12 text-center">
            <Award className="mx-auto h-10 w-10 text-[#A855F7]" />
            <h2 className="mt-4 font-display text-lg font-semibold text-white">
              No certificates issued yet
            </h2>
            <p className="mt-2 max-w-md mx-auto text-sm text-slate-400">
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
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="flex flex-col justify-between rounded-2xl border border-[#6D28D9]/50 bg-[#17112B] p-6"
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
                  <span className="text-xs text-slate-400">Issued by {cert.issuedBy}</span>
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
          <div className="mt-12 rounded-2xl border border-white/10 bg-[#17112B] p-6">
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
                    <p className="mt-0.5 text-xs text-slate-400 tabular-nums">
                      {item.progressPercent}% completed
                    </p>
                  </div>
                  <Link
                    to={`/courses/${item.courseId}`}
                    className="rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-white hover:border-[#A855F7] self-start sm:self-auto"
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
