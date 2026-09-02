import Link from "next/link";
import { MarketingNav } from "@/components/marketing-nav";
import { Button } from "@/components/ui";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    perks: [
      "Job board + match scores",
      "ATS scanner",
      "5 Auto-Apply credits",
      "Cover letter generator",
    ],
  },
  {
    name: "Pro",
    price: "$29",
    perks: [
      "Unlimited resume variants",
      "Interview Buddy + mock interviews",
      "25 starter credits",
      "Kanban tracker + outreach",
      "Multi-language resume export",
    ],
    highlight: true,
  },
  {
    name: "Credit packs",
    price: "from $49",
    perks: [
      "100 credits = 100 applications",
      "Credits never expire",
      "Manual, hybrid, or full auto modes",
      "Per-application tailored docs",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="atmosphere min-h-screen">
      <MarketingNav />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="font-display text-5xl text-ink">Simple pricing</h1>
        <p className="mt-3 max-w-xl text-ink/65">
          Toolkit subscription plus optional Auto-Apply credits — same model as leading
          AI apply platforms.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`rounded-3xl border p-6 ${
                p.highlight
                  ? "border-teal-800 bg-teal-800 text-sand-50 shadow-glow"
                  : "border-teal-900/10 bg-white/70"
              }`}
            >
              <div className="text-sm uppercase tracking-wider opacity-70">{p.name}</div>
              <div className="mt-2 font-display text-4xl">
                {p.price}
                {p.name === "Pro" ? (
                  <span className="text-base opacity-70">/mo</span>
                ) : null}
              </div>
              <ul className="mt-6 space-y-2 text-sm opacity-90">
                {p.perks.map((perk) => (
                  <li key={perk}>• {perk}</li>
                ))}
              </ul>
              <Link href="/signup" className="mt-8 block">
                <Button
                  className={
                    p.highlight
                      ? "w-full bg-sand-50 text-teal-900 hover:bg-white"
                      : "w-full"
                  }
                >
                  Get started
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
