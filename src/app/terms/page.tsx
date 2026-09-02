import Link from "next/link";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";

export const metadata = {
  title: "Terms of Service · ApplyPilot",
};

export default function TermsPage() {
  return (
    <div className="atmosphere min-h-screen">
      <MarketingNav />
      <main className="mx-auto max-w-3xl px-6 py-14">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
          Legal
        </p>
        <h1 className="mt-3 font-display text-4xl text-ink">Terms of Service</h1>
        <p className="mt-2 text-sm text-ink/50">Last updated: September 2, 2026</p>
        <div className="mt-8 space-y-4 text-ink/75">
          <p>
            By using ApplyPilot you agree to these terms. If you do not agree, do not use the
            service.
          </p>
          <h2 className="font-display text-2xl text-ink">The service</h2>
          <p>
            ApplyPilot helps you discover roles from public/legal job sources, tailor documents,
            track applications, and practice interviews. Credits purchase Auto-Apply{" "}
            <em>packages</em> (tailored materials + employer apply links). You confirm and submit
            applications on the employer’s site.
          </p>
          <h2 className="font-display text-2xl text-ink">Acceptable use</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>No scraping of LinkedIn, Indeed, Glassdoor, or other ToS-restricted sites via our platform</li>
            <li>No unauthorized mass submission that violates employer or ATS terms</li>
            <li>No using Interview Buddy to secretly cheat on live interviews</li>
            <li>No abuse, malware, or attempts to disrupt the service</li>
          </ul>
          <h2 className="font-display text-2xl text-ink">Billing</h2>
          <p>
            Paid plans and credit packs are billed through Stripe. Credits for Auto-Apply packages
            generally do not expire unless we state otherwise at purchase. Refunds are handled
            case-by-case according to applicable law.
          </p>
          <h2 className="font-display text-2xl text-ink">Disclaimers</h2>
          <p>
            Job outcomes are not guaranteed. AI-generated content can be inaccurate — you are
            responsible for reviewing resumes, letters, and interview answers before use.
          </p>
          <h2 className="font-display text-2xl text-ink">Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, ApplyPilot is not liable for indirect or
            consequential damages, or for hiring decisions by third parties.
          </p>
          <p>
            <Link href="/privacy" className="text-teal-800 underline">
              Privacy Policy
            </Link>{" "}
            ·{" "}
            <Link href="/ai-disclosure" className="text-teal-800 underline">
              AI disclosure
            </Link>
          </p>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
