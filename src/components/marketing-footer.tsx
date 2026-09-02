import Link from "next/link";
import { Sparkles } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t border-teal-900/10 px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div>
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-800 text-sand-50">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-display text-xl text-ink">ApplyPilot</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-ink/55">
            AI job-search co-pilot for matching, tailoring, Auto-Apply, and interview prep.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div className="space-y-2">
            <div className="font-semibold text-ink">Product</div>
            <Link href="/features" className="block text-ink/60 hover:text-ink">
              Features
            </Link>
            <Link href="/features#auto-apply" className="block text-ink/60 hover:text-ink">
              Auto-Apply
            </Link>
            <Link href="/features#resume" className="block text-ink/60 hover:text-ink">
              Resume
            </Link>
            <Link href="/features#interview-buddy" className="block text-ink/60 hover:text-ink">
              Interview Buddy
            </Link>
          </div>
          <div className="space-y-2">
            <div className="font-semibold text-ink">Company</div>
            <Link href="/pricing" className="block text-ink/60 hover:text-ink">
              Pricing
            </Link>
            <Link href="/login" className="block text-ink/60 hover:text-ink">
              Log in
            </Link>
            <Link href="/signup" className="block text-ink/60 hover:text-ink">
              Sign up
            </Link>
          </div>
          <div className="space-y-2">
            <div className="font-semibold text-ink">Legal</div>
            <Link href="/privacy" className="block text-ink/60 hover:text-ink">
              Privacy
            </Link>
            <Link href="/terms" className="block text-ink/60 hover:text-ink">
              Terms
            </Link>
            <Link href="/ai-disclosure" className="block text-ink/60 hover:text-ink">
              AI disclosure
            </Link>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-xs text-ink/40">
        © {new Date().getFullYear()} ApplyPilot. Auto-Apply builds tailored packages and employer
        apply links — you confirm submission on the employer site. We do not scrape LinkedIn or
        Indeed.
      </p>
    </footer>
  );
}
