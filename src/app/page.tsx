import Link from "next/link";
import { MarketingNav } from "@/components/marketing-nav";
import { MarketingFaq } from "@/components/marketing-faq";
import { MarketingTestimonials } from "@/components/marketing-testimonials";
import { MarketingFooter } from "@/components/marketing-footer";
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
    id: "auto-apply",
    title: "Auto-Apply",
    body: "Set criteria once. ApplyPilot matches roles, tailors documents, and queues applications while you prep interviews.",
    href: "/features#auto-apply",
  },
  {
    id: "resume",
    title: "AI Resume Builder",
    body: "Generate ATS-friendly resumes per role — then translate, export, and keep a library of tailored variants.",
    href: "/features#resume",
  },
  {
    id: "cover-letter",
    title: "AI Cover Letter",
    body: "Personalized letters that mirror the job’s language without sounding robotic.",
    href: "/features#resume",
  },
  {
    id: "ats",
    title: "ATS Scanner",
    body: "Keyword gap analysis, formatting checks, and rewrite tips before you hit submit.",
    href: "/features#resume",
  },
  {
    id: "mock-interview",
    title: "Mock Interview",
    body: "Role-specific practice with instant feedback so you’re ready when callbacks land.",
    href: "/features#interview-buddy",
  },
  {
    id: "interview-buddy",
    title: "Interview Buddy",
    body: "Live answer suggestions structured in STAR format during interview simulations.",
    href: "/features#interview-buddy",
  },
];

export default function HomePage() {
  const loop = [...TICKER, ...TICKER];

  return (
    <div className="atmosphere min-h-screen">
      <MarketingNav />

      <section className="relative overflow-hidden px-6 pb-16 pt-8 md:pb-20 md:pt-14">
        <div className="hero-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -left-24 top-24 h-64 w-64 rounded-full bg-teal-700/10 blur-3xl animate-drift" />
        <div className="pointer-events-none absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-[rgba(201,148,74,0.14)] blur-3xl animate-drift-slow" />

        <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
          <div className="animate-fade-up">
            <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-ink sm:text-6xl md:text-7xl lg:text-[5.25rem]">
              ApplyPilot
            </h1>
            <p className="mt-5 font-display text-2xl leading-snug text-teal-800 sm:text-3xl md:text-4xl">
              Stop applying for weeks. Start interviewing in days.
            </p>
            <p className="mt-5 max-w-xl text-base text-ink/70 sm:text-lg">
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
            <p className="mt-4 text-sm text-ink/45">
              Demo: demo@applypilot.com / demo1234
            </p>
          </div>

          <div className="animate-float relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-3 rounded-[2.25rem] bg-gradient-to-br from-teal-800/15 via-transparent to-[rgba(201,148,74,0.2)] blur-sm" />
            <div className="relative overflow-hidden rounded-[2rem] border border-teal-900/10 bg-white/65 p-5 shadow-glow backdrop-blur sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wider text-teal-800">
                  Live matches
                </div>
                <div className="h-2 w-2 animate-pulse-soft rounded-full bg-teal-700" />
              </div>
              <div className="space-y-3">
                {TICKER.slice(0, 5).map(([company, title], i) => (
                  <div
                    key={company + title}
                    className="animate-fade-up flex items-center justify-between gap-3 rounded-2xl bg-sand-50/80 px-3 py-3 sm:px-4"
                    style={{ animationDelay: `${0.15 + i * 0.08}s` }}
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium text-ink">{title}</div>
                      <div className="text-sm text-ink/55">{company}</div>
                    </div>
                    <div className="shrink-0 rounded-lg bg-teal-800/10 px-2 py-1 text-xs font-semibold text-teal-800">
                      {82 - i * 3}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative mx-auto mt-14 max-w-6xl overflow-hidden rounded-2xl border border-teal-900/10 bg-teal-900/[0.04] py-3.5 md:mt-16 md:py-4">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[rgba(247,243,234,0.95)] to-transparent md:w-16" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[rgba(247,243,234,0.95)] to-transparent md:w-16" />
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
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <Link
              href="/features#auto-apply"
              className="text-teal-800 underline-offset-4 hover:underline"
            >
              Auto-Apply
            </Link>
            <span className="text-ink/25">/</span>
            <Link
              href="/features#resume"
              className="text-teal-800 underline-offset-4 hover:underline"
            >
              Resume
            </Link>
            <span className="text-ink/25">/</span>
            <Link
              href="/features#interview-buddy"
              className="text-teal-800 underline-offset-4 hover:underline"
            >
              Interview Buddy
            </Link>
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                id={f.id}
                className="animate-fade-up scroll-mt-24 border-t border-teal-900/15 pt-5"
                style={{ animationDelay: `${0.05 + i * 0.06}s` }}
              >
                <h3 className="font-display text-2xl text-ink">{f.title}</h3>
                <p className="mt-3 text-ink/65">{f.body}</p>
                <Link
                  href={f.href}
                  className="mt-4 inline-block text-sm font-medium text-teal-800 underline-offset-4 hover:underline"
                >
                  Learn more
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="px-6 pb-8">
        <div className="mx-auto max-w-6xl rounded-[2rem] bg-teal-800 px-6 py-10 text-sand-50 sm:px-8 md:px-12 md:py-12">
          <h2 className="font-display text-3xl sm:text-4xl">How ApplyPilot works</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {[
              "Upload or build your master resume",
              "Set role, location, and salary preferences",
              "Tailor, scan, and auto-apply with credits",
              "Track interviews and practice with Buddy",
            ].map((step, i) => (
              <li key={step} className="animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="text-sm uppercase tracking-wider text-sand-50/60">
                  Step {i + 1}
                </div>
                <div className="mt-2 text-lg leading-snug">{step}</div>
              </li>
            ))}
          </ol>
          <div className="mt-10">
            <Link href="/signup">
              <Button size="lg" className="bg-sand-50 text-teal-900 hover:bg-white">
                Create your account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <MarketingTestimonials />
      <MarketingFaq />

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl border-t border-teal-900/10 pt-14 text-center">
          <h2 className="font-display text-3xl text-ink md:text-4xl">
            Ready when your next role is
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-ink/65">
            Start free with five credits — or jump in with the demo account and explore the
            full Pro toolkit.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup">
              <Button size="lg">Start free</Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="secondary">
                See pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
