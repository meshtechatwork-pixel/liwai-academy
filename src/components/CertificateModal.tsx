import { Award, Download, Printer, X } from 'lucide-react';
import { Certificate } from '../types/learning';

interface CertificateModalProps {
  certificate: Certificate;
  onClose: () => void;
}

export default function CertificateModal({ certificate, onClose }: CertificateModalProps) {
  const issuedDate = (() => {
    const raw = certificate.issuedAt;
    if (
      raw &&
      typeof raw === 'object' &&
      'toDate' in raw &&
      typeof (raw as { toDate: () => Date }).toDate === 'function'
    ) {
      return (raw as { toDate: () => Date }).toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    if (typeof raw === 'string') {
      return new Date(raw).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  })();

  const handleDownloadSvg = () => {
    const safeStudent = certificate.studentName.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const safeTitle = certificate.courseTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="850" viewBox="0 0 1200 850">
  <rect width="1200" height="850" fill="#100B20"/>
  <rect x="36" y="36" width="1128" height="778" rx="16" fill="#17112B" stroke="#6D28D9" stroke-width="3"/>
  <rect x="52" y="52" width="1096" height="746" rx="12" fill="none" stroke="#A855F7" stroke-opacity="0.35" stroke-width="1"/>
  <text x="600" y="130" text-anchor="middle" fill="#A855F7" font-family="sans-serif" font-size="22" font-weight="700" letter-spacing="5">LEARN IT WITH AI</text>
  <text x="600" y="210" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="48" font-weight="800">Certificate of Completion</text>
  <text x="600" y="285" text-anchor="middle" fill="#CBD5E1" font-family="sans-serif" font-size="22">This certifies that</text>
  <text x="600" y="365" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-size="52" font-weight="700">${safeStudent}</text>
  <line x1="280" y1="395" x2="920" y2="395" stroke="#A855F7" stroke-opacity="0.45" stroke-width="2"/>
  <text x="600" y="460" text-anchor="middle" fill="#CBD5E1" font-family="sans-serif" font-size="22">has successfully completed the ${certificate.level} curriculum in</text>
  <text x="600" y="525" text-anchor="middle" fill="#C084FC" font-family="sans-serif" font-size="34" font-weight="700">${safeTitle}</text>
  <text x="600" y="575" text-anchor="middle" fill="#94A3B8" font-family="sans-serif" font-size="20">Category: ${certificate.courseCategory}</text>
  <text x="160" y="720" fill="#94A3B8" font-family="monospace" font-size="16">Certificate ID: ${certificate.certificateCode}</text>
  <text x="600" y="720" text-anchor="middle" fill="#E2E8F0" font-family="sans-serif" font-size="18" font-weight="600">Issued by Learn It With AI</text>
  <text x="1040" y="720" text-anchor="end" fill="#94A3B8" font-family="sans-serif" font-size="16">${issuedDate}</text>
</svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${certificate.certificateCode}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-2xl border border-white/15 bg-[#17112B]/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 print:hidden">
          <div className="flex items-center gap-2.5 text-white">
            <Award className="h-5 w-5 text-[#A855F7]" />
            <h2 className="font-display text-lg font-semibold">Official Certificate</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadSvg}
              className="inline-flex items-center gap-2 rounded-lg bg-[#6D28D9] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#7C3AED]"
            >
              <Download className="h-4 w-4" />
              Download Certificate
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/5"
            >
              <Printer className="h-4 w-4" />
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-slate-300 hover:text-white"
              aria-label="Close certificate preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas */}
        <div className="mt-6 rounded-xl border-2 border-[#6D28D9] bg-[#100B20] p-8 text-center sm:p-12">
          <p className="font-display text-xs font-semibold tracking-[0.25em] text-[#A855F7] uppercase">
            Learn It With AI
          </p>
          <h3 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
            Certificate of Completion
          </h3>
          <p className="mt-6 text-sm text-slate-300">This certifies that</p>
          <p className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
            {certificate.studentName}
          </p>
          <div className="mx-auto mt-4 h-px w-64 bg-[#A855F7]/40" />
          <p className="mt-6 text-sm text-slate-300">
            has successfully completed all requirements for the{' '}
            <span className="font-semibold text-white">{certificate.level}</span> track in
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-[#C084FC]">
            {certificate.courseTitle}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Category: {certificate.courseCategory}
          </p>

          <div className="mt-10 grid grid-cols-1 gap-4 border-t border-white/10 pt-6 text-xs text-slate-400 sm:grid-cols-3">
            <div className="sm:text-left">
              <span className="block text-slate-500">Verification Code</span>
              <span className="font-mono text-slate-200">{certificate.certificateCode}</span>
            </div>
            <div>
              <span className="block text-slate-500">Issued By</span>
              <span className="font-semibold text-white">
                {certificate.issuedBy || 'Learn It With AI'}
              </span>
            </div>
            <div className="sm:text-right">
              <span className="block text-slate-500">Issue Date</span>
              <span className="text-slate-200">{issuedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
