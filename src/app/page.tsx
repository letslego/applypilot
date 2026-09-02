import Link from "next/link";
import { MarketingNav } from "@/components/marketing-nav";
import { Button } from "@/components/ui";

const TICKER = [
  ["Stripe", "Senior Backend Engineer"],
  ["Netflix", "Staff Software Engineer"],
  ["Notion", "Full-Stack Engineer"],
  ["Figma", "Product Engineer"],
  ["Airbnb", "Senior Data Scientist"],
  ["Linear", "Frontend Engineer"],
  ["Vercel", "DX Engineer"],
  ["Ramp", "Software Engineer"],
];

const FEATURES = [
  {
    title: "Auto-Apply",
    body: "Set criteria once. ApplyPilot matches roles, tailors documents, and queues applications while you prep interviews.",
  },
  {
    title: "AI Resume Builder",
    body: "Generate ATS-friendly resumes per role — then translate, export, and keep a library of tailored variants.",
  },
  {
    title: "AI Cover Letter",
    body: "Personalized letters that mirror the job’s language without sounding robotic.",
  },
  {
    title: "ATS Scanner",
    body: "Keyword gap analysis, formatting checks, and rewrite tips before you hit submit.",
  },
  {
    title: "Mock Interview",
    body: "Role-specific practice with instant feedback so you’re ready when callbacks land.",
  },
  {
    title: "Interview Buddy",
    body: "Live answer suggestions structured in STAR format during interview simulations.",
  },
];

export default function HomePage() {
  const loop = [...TICKER, ...TICKER];

  return (
    <div className="atmosphere min-h-screen">
      <MarketingNav />

      <section className="relative overflow-hidden px-6 pb-20 pt-10 md:pt-16">
        <div className="hero-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="animate-fade-up">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-teal-800">
              ApplyPilot
            </p>
            <h1 className="font-display text-5xl leading-[1.05] tracking-tight text-ink md:text-6xl lg:text-7xl">
              Stop applying for weeks.
              <span className="block text-teal-800">Start interviewing in days.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink/70">
              Find high-match roles, tailor your resume and cover letter, auto-apply with
              credits you control, and coach yourself to the offer.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup">
                <Button size="lg">Start free</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="secondary">
                  Demo login
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-ink/50">
              Demo: demo@applypilot.com / demo1234
            </p>
          </div>

          <div className="animate-float relative rounded-[2rem] border border-teal-900/10 bg-white/60 p-6 shadow-glow backdrop-blur">
            <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-teal-800">
              Live matches
            </div>
            <div className="space-y-3">
              {TICKER.slice(0, 5).map(([company, title], i) => (
                <div
                  key={company + title}
                  className="flex items-center justify-between rounded-2xl bg-sand-50/80 px-4 py-3"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div>
                    <div className="font-medium text-ink">{title}</div>
                    <div className="text-sm text-ink/55">{company}</div>
                  </div>
                  <div className="rounded-lg bg-teal-800/10 px-2 py-1 text-xs font-semibold text-teal-800">
                    {82 - i * 3}% match
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative mx-auto mt-16 max-w-6xl overflow-hidden rounded-2xl border border-teal-900/10 bg-teal-900/[0.04] py-4">
          <div className="animate-marquee flex w-max gap-10 whitespace-nowrap px-4 text-sm text-ink/70">
            {loop.map(([company, title], idx) => (
              <span key={company + title + idx} className="inline-flex items-center gap-2">
                <span className="font-semibold text-ink">{company}</span>
                <span>{title}</span>
                <span className="text-ink/35">·</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-4xl text-ink md:text-5xl">
            Everything you need to get hired faster
          </h2>
          <p className="mt-3 max-w-2xl text-ink/65">
            Feature parity with leading AI apply suites — plus Kanban tracking, outreach
            templates, salary signals, and an autofill answer bank.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-3xl border border-teal-900/8 bg-white/55 p-6">
                <h3 className="font-display text-2xl text-ink">{f.title}</h3>
                <p className="mt-3 text-ink/65">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="px-6 pb-24">
        <div className="mx-auto max-w-6xl rounded-[2rem] bg-teal-800 px-8 py-12 text-sand-50 md:px-12">
          <h2 className="font-display text-4xl">How ApplyPilot works</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-4">
            {[
              "Upload or build your master resume",
              "Set role, location, and salary preferences",
              "Tailor, scan, and auto-apply with credits",
              "Track interviews and practice with Buddy",
            ].map((step, i) => (
              <li key={step}>
                <div className="text-sm uppercase tracking-wider text-sand-50/60">
                  Step {i + 1}
                </div>
                <div className="mt-2 text-lg">{step}</div>
              </li>
            ))}
          </ol>
          <div className="mt-10">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-sand-50 text-teal-900 hover:bg-white"
              >
                Create your account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
