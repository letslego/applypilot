import Link from "next/link";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";

export const metadata = {
  title: "Privacy Policy · ApplyPilot",
};

export default function PrivacyPage() {
  return (
    <div className="atmosphere min-h-screen">
      <MarketingNav />
      <main className="mx-auto max-w-3xl px-6 py-14">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
          Legal
        </p>
        <h1 className="mt-3 font-display text-4xl text-ink">Privacy Policy</h1>
        <p className="mt-2 text-sm text-ink/50">Last updated: September 2, 2026</p>
        <div className="prose-ap mt-8 space-y-4 text-ink/75">
          <p>
            ApplyPilot (“we”) provides an AI job-search co-pilot. This policy explains what we
            collect and how we use it.
          </p>
          <h2 className="font-display text-2xl text-ink">What we collect</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Account data: name, email, password hash</li>
            <li>Profile and resume content you upload or generate</li>
            <li>Application tracker activity and Auto-Apply preferences</li>
            <li>Billing metadata via Stripe (we do not store full card numbers)</li>
            <li>Product usage events needed to operate and secure the service</li>
          </ul>
          <h2 className="font-display text-2xl text-ink">How we use data</h2>
          <p>
            We use your data to provide matching, document generation, interview practice,
            billing, job alerts, and support. Optional AI features send relevant resume/job
            snippets to our model provider (e.g. OpenAI) under their data processing terms.
          </p>
          <h2 className="font-display text-2xl text-ink">Sharing</h2>
          <p>
            We share data with infrastructure providers (hosting, email, payments, AI) only as
            needed to run ApplyPilot. We do not sell personal data.
          </p>
          <h2 className="font-display text-2xl text-ink">Your rights</h2>
          <p>
            Depending on your region (including GDPR/CCPA), you may request access, correction,
            deletion, or export of your data. Contact support via the email on your account
            settings page.
          </p>
          <h2 className="font-display text-2xl text-ink">Retention</h2>
          <p>
            We retain account data while your account is active and for a reasonable period
            afterward for backups, disputes, and legal obligations.
          </p>
          <p>
            See also our <Link href="/terms" className="text-teal-800 underline">Terms</Link>{" "}
            and{" "}
            <Link href="/ai-disclosure" className="text-teal-800 underline">
              AI disclosure
            </Link>
            .
          </p>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
