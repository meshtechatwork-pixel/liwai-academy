export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#100B20] text-white">
      <div className="mx-auto max-w-4xl px-6 py-12 lg:py-16">
        <div className="border-b border-white/10 pb-8">
          <p className="text-xs font-semibold tracking-wide text-[#A855F7]">Legal · Learn It With AI</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs text-slate-400">Effective Date: 2026</p>
        </div>

        <div className="mt-8 space-y-6 rounded-2xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-6 sm:p-8 text-sm leading-relaxed text-slate-300">
          <section>
            <h2 className="font-display text-lg font-semibold text-white">
              1. Information We Collect
            </h2>
            <p className="mt-2">
              When you register for Learn It With AI, we collect the profile details you provide,
              including your name, email address, phone number, location (country, county/state,
              town/city), optional profile picture, course enrollments, lesson progress, and saved
              AI prompts.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-white">
              2. How We Use Your Data
            </h2>
            <p className="mt-2">
              Your data powers your personalized Student Dashboard, tracks course and lesson
              completion, issues verifiable completion certificates, stores your favourite AI
              prompts, and lets you receive platform notifications.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-white">
              3. Security &amp; Access Control
            </h2>
            <p className="mt-2">
              Learn It With AI enforces strict Firebase Authentication and Firestore Security Rules
              so student profiles, progress records, and prompt libraries remain private to your
              authenticated account and authorized platform administrators. Certificate verification
              records expose only the credential code, recipient name, course title, and issue date.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-white">
              4. AI Prompt Processing
            </h2>
            <p className="mt-2">
              Prompts generated through our AI Prompt Generator are processed securely through our
              server-side backend service. API keys are never exposed in browser code.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-white">
              5. Your Rights &amp; Contact
            </h2>
            <p className="mt-2">
              You may update your profile details at any time from the My Profile page or contact
              our support team via the Contact Us page for account data inquiries.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
