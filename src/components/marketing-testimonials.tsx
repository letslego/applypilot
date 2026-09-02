const TESTIMONIALS = [
  {
    quote:
      "I stopped blank-staring at applications. ApplyPilot matched roles, tailored my resume, and I had interviews lined up the same week.",
    name: "Maya R.",
    role: "Product Engineer",
  },
  {
    quote:
      "The ATS scanner’s keyword gaps were brutally useful. Once I fixed those, my response rate jumped overnight.",
    name: "Jordan K.",
    role: "Data Scientist",
  },
  {
    quote:
      "Interview Buddy kept me calm on practice rounds. STAR prompts on demand beat scrolling notes mid-call.",
    name: "Samir A.",
    role: "Backend Engineer",
  },
];

export function MarketingTestimonials() {
  return (
    <section id="stories" className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-4xl text-ink md:text-5xl">
          Built for people who want interviews, not busywork
        </h2>
        <p className="mt-3 max-w-2xl text-ink/65">
          Candidates use ApplyPilot to tighten documents, queue high-match applications, and
          practice until the offer call feels familiar.
        </p>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <blockquote
              key={t.name}
              className="animate-fade-up border-l-2 border-teal-800/40 pl-5"
              style={{ animationDelay: `${0.1 + i * 0.12}s` }}
            >
              <p className="text-lg leading-relaxed text-ink/80">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-4 text-sm text-ink/55">
                <span className="font-semibold text-ink">{t.name}</span>
                <span className="mx-1.5 text-ink/30">·</span>
                {t.role}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
