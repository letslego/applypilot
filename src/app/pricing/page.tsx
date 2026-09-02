import Link from "next/link";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { MarketingFaq } from "@/components/marketing-faq";
import { Button } from "@/components/ui";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    blurb: "Try the full search loop with starter credits.",
    perks: [
      "Job board + match scores",
      "ATS scanner",
      "5 Auto-Apply credits",
      "Cover letter generator",
    ],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: "$29",
    blurb: "Unlimited variants, interview tools, and more credits.",
    perks: [
      "Unlimited resume variants",
      "Interview Buddy + mock interviews",
      "25 starter credits",
      "Kanban tracker + outreach",
      "Multi-language resume export",
    ],
    highlight: true,
    cta: "Go Pro",
  },
  {
    name: "Credit packs",
    price: "from $49",
    blurb: "Scale Auto-Apply without a seat upgrade.",
    perks: [
      "100 credits = 100 applications",
      "Credits never expire",
      "Manual, hybrid, or full auto modes",
      "Per-application tailored docs",
    ],
    cta: "Get credits",
  },
];

const PRICING_FAQS = [
  {
    q: "Can I use credits on Free?",
    a: "Yes. Free includes 5 Auto-Apply credits. Buy credit packs anytime — they work on Free or Pro and never expire.",
  },
  {
    q: "What’s included in Pro?",
    a: "Unlimited resume variants, Interview Buddy, mock interviews, Kanban tracker, outreach templates, multi-language export, and 25 starter credits.",
  },
  {
    q: "Is checkout real?",
    a: "Yes when Stripe keys are configured — Pro subscriptions and credit packs bill through Stripe Checkout + webhooks. Without keys, local/dev uses a safe mock upgrade path.",
  },
];

export default function PricingPage() {
  return (
    <div className="atmosphere min-h-screen">
      <MarketingNav />
      <div className="relative overflow-hidden px-6 pb-8 pt-10 md:pt-14">
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-6xl">
          <p className="animate-fade-up text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
            ApplyPilot
          </p>
          <h1 className="animate-fade-up mt-3 font-display text-4xl text-ink sm:text-5xl md:text-6xl">
            Simple pricing
          </h1>
          <p
            className="animate-fade-up mt-4 max-w-xl text-ink/65"
            style={{ animationDelay: "0.1s" }}
          >
            Toolkit subscription plus optional Auto-Apply credits — same model as leading AI
            apply platforms. Start free, upgrade when you’re ready.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((p, i) => (
            <div
              key={p.name}
              className={`animate-fade-up flex flex-col rounded-[1.75rem] border p-6 sm:p-7 ${
                p.highlight
                  ? "border-teal-800 bg-teal-800 text-sand-50 shadow-glow md:-translate-y-2"
                  : "border-teal-900/10 bg-white/70"
              }`}
              style={{ animationDelay: `${0.08 + i * 0.08}s` }}
            >
              <div className="text-sm uppercase tracking-wider opacity-70">{p.name}</div>
              <div className="mt-2 font-display text-4xl">
                {p.price}
                {p.name === "Pro" ? (
                  <span className="text-base opacity-70">/mo</span>
                ) : null}
              </div>
              <p
                className={`mt-3 text-sm ${p.highlight ? "text-sand-50/75" : "text-ink/60"}`}
              >
                {p.blurb}
              </p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm opacity-90">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex gap-2">
                    <span className={p.highlight ? "text-sand-50/50" : "text-teal-800"}>
                      ✓
                    </span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={p.name === "Credit packs" ? "/app/auto-apply" : p.name === "Pro" ? "/app/settings" : "/signup"}
                className="mt-8 block"
              >
                <Button
                  className={
                    p.highlight
                      ? "w-full bg-sand-50 text-teal-900 hover:bg-white"
                      : "w-full"
                  }
                >
                  {p.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-ink/50">
          Billing via Stripe ·{" "}
          <Link href="/terms" className="text-teal-800 underline-offset-4 hover:underline">
            Terms
          </Link>{" "}
          ·{" "}
          <Link href="/privacy" className="text-teal-800 underline-offset-4 hover:underline">
            Privacy
          </Link>
          .
        </p>
      </div>

      <MarketingFaq items={PRICING_FAQS} id="pricing-faq" />
      <MarketingFooter />
    </div>
  );
}
