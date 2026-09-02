import Link from "next/link";
import type { Metadata } from "next";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFooter } from "@/components/marketing-footer";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Features — ApplyPilot",
  description:
    "Auto-Apply, AI resume & cover letters, ATS scanning, and Interview Buddy — the ApplyPilot toolkit.",
};

const DEEP_LINKS = [
  {
    id: "auto-apply",
    title: "Auto-Apply",
    headline: "Match once. Queue applications on your terms.",
    body: "Set role, location, salary, and mode — manual, hybrid, or full auto. ApplyPilot scores listings, burns credits you control, and advances a realistic application queue without unauthorized board submissions.",
    points: [
      "Preference-driven matching with credit wallet",
      "Tailored docs attached per application",
      "Credits never expire — 1 credit = 1 application",
    ],
    href: "/signup",
    cta: "Try Auto-Apply",
  },
  {
    id: "resume",
    title: "Resume & documents",
    headline: "A master resume that becomes every tailored variant.",
    body: "Build or paste your resume, then generate ATS-friendly versions per job. Scan for keyword gaps, rewrite weak sections, produce cover letters, and keep a library of variants ready to export or print.",
    points: [
      "AI builder + LinkedIn-style paste import",
      "ATS scanner with keyword gap heatmap",
      "Cover letters tied to resume + job",
    ],
    href: "/signup",
    cta: "Build a resume",
  },
  {
    id: "interview-buddy",
    title: "Interview Buddy",
    headline: "Practice until the live round feels familiar.",
    body: "Run role-specific mock interviews with instant feedback, then switch on Interview Buddy for STAR-structured suggestions during simulated live coaching — the same calm you’d want on Zoom or Meet.",
    points: [
      "Mock interview chat with feedback",
      "Live STAR coaching suggestions",
      "Pairs with tracker when callbacks land",
    ],
    href: "/signup",
    cta: "Start practicing",
  },
];

export default function FeaturesPage() {
  return (
    <div className="atmosphere min-h-screen">
      <MarketingNav />

      <section className="relative overflow-hidden px-6 pb-12 pt-10 md:pt-14">
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative mx-auto max-w-6xl">
          <p className="animate-fade-up text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
            ApplyPilot
          </p>
          <h1 className="animate-fade-up mt-3 font-display text-4xl text-ink sm:text-5xl md:text-6xl">
            Features that move you from apply to interview
          </h1>
          <p
            className="animate-fade-up mt-4 max-w-2xl text-ink/65"
            style={{ animationDelay: "0.1s" }}
          >
            Deep dives into Auto-Apply, Resume, and Interview Buddy — jump to a section or
            start free and explore the product.
          </p>
          <div
            className="animate-fade-up mt-8 flex flex-wrap gap-3"
            style={{ animationDelay: "0.15s" }}
          >
            {DEEP_LINKS.map((d) => (
              <a
                key={d.id}
                href={`#${d.id}`}
                className="rounded-xl border border-teal-900/10 bg-white/70 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-white"
              >
                {d.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-4 px-6 pb-20">
        {DEEP_LINKS.map((d, i) => (
          <section
            key={d.id}
            id={d.id}
            className={`scroll-mt-24 rounded-[2rem] px-6 py-10 sm:px-10 md:py-14 ${
              i % 2 === 1
                ? "bg-teal-800 text-sand-50"
                : "border border-teal-900/10 bg-white/55"
            }`}
          >
            <p
              className={`text-sm font-semibold uppercase tracking-[0.18em] ${
                i % 2 === 1 ? "text-sand-50/60" : "text-teal-800"
              }`}
            >
              {d.title}
            </p>
            <h2 className="mt-3 font-display text-3xl leading-tight md:text-4xl">
              {d.headline}
            </h2>
            <p
              className={`mt-4 max-w-2xl text-base leading-relaxed md:text-lg ${
                i % 2 === 1 ? "text-sand-50/80" : "text-ink/65"
              }`}
            >
              {d.body}
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {d.points.map((point) => (
                <li
                  key={point}
                  className={`text-sm leading-snug ${
                    i % 2 === 1
                      ? "border-t border-sand-50/20 pt-3 text-sand-50/85"
                      : "border-t border-teal-900/10 pt-3 text-ink/70"
                  }`}
                >
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link href={d.href}>
                <Button
                  size="lg"
                  className={
                    i % 2 === 1
                      ? "bg-sand-50 text-teal-900 hover:bg-white"
                      : undefined
                  }
                >
                  {d.cta}
                </Button>
              </Link>
            </div>
          </section>
        ))}
      </div>

      <MarketingFooter />
    </div>
  );
}
