import Link from "next/link";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";

export const metadata = {
  title: "AI Disclosure · ApplyPilot",
};

export default function AiDisclosurePage() {
  return (
    <div className="atmosphere min-h-screen">
      <MarketingNav />
      <main className="mx-auto max-w-3xl px-6 py-14">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
          Transparency
        </p>
        <h1 className="mt-3 font-display text-4xl text-ink">AI disclosure</h1>
        <div className="mt-8 space-y-4 text-ink/75">
          <p>
            ApplyPilot uses artificial intelligence to help generate and score job-search
            materials. When <code className="text-sm">OPENAI_API_KEY</code> is configured, prompts
            may include resume excerpts, job descriptions, and interview context.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Outputs can contain errors — always review before sending to employers.</li>
            <li>
              Interview Buddy is a practice coach, not a hidden live-interview cheating tool.
            </li>
            <li>
              Auto-Apply prepares packages for you to submit on official employer apply pages; it
              does not stealth-apply on your behalf to restricted boards.
            </li>
            <li>
              Matching and ATS scores are advisory heuristics, not guarantees of recruiter systems.
            </li>
          </ul>
          <p>
            Questions? See{" "}
            <Link href="/privacy" className="text-teal-800 underline">
              Privacy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="text-teal-800 underline">
              Terms
            </Link>
            .
          </p>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
