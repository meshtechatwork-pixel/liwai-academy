export default function TermsPage() {
  return (
    <div className="bg-[#100B20] text-white">
      <div className="mx-auto max-w-4xl px-6 py-12 lg:py-16">
        <div className="border-b border-white/10 pb-8">
          <p className="text-xs font-semibold tracking-wide text-[#A855F7]">Legal · Learn It With AI</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
            Terms and Conditions
          </h1>
          <p className="mt-2 text-xs text-slate-400">Effective Date: 2026</p>
        </div>

        <div className="mt-8 space-y-6 rounded-2xl border border-white/10 bg-[#17112B]/80 backdrop-blur-md p-6 sm:p-8 text-sm leading-relaxed text-slate-300">
          <section>
            <h2 className="font-display text-lg font-semibold text-white">
              1. Acceptance of Terms
            </h2>
            <p className="mt-2">
              By accessing or registering on Learn It With AI, you agree to comply with these Terms
              and Conditions and all applicable platform guidelines.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-white">
              2. Student Accounts &amp; Conduct
            </h2>
            <p className="mt-2">
              You are responsible for maintaining the confidentiality of your login credentials and
              providing accurate registration details for course certificates. Accounts must not be
              used to scrape, redistribute, or resell proprietary course videos or downloadable
              learning materials.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-white">
              3. Certificates &amp; Verification
            </h2>
            <p className="mt-2">
              Certificates are awarded upon 100% completion of course requirements or direct
              administrative issuance. Each certificate carries a unique verification code tracked
              by Learn It With AI.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-white">
              4. AI Prompt Generator Usage
            </h2>
            <p className="mt-2">
              Prompts generated through the AI Prompt Generator are provided for educational and
              professional productivity. Users are responsible for reviewing generated outputs
              before deploying code, marketing campaigns, or business deliverables.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-white">
              5. Curriculum Updates
            </h2>
            <p className="mt-2">
              Learn It With AI may update course modules, skill levels, and learning resources to
              keep curricula current with modern industry workflows.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
