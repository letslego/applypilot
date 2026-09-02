import type { ResumeContent } from "@/data/demo-resume";

export function ResumePreview({
  content,
  className = "",
}: {
  content: ResumeContent;
  className?: string;
}) {
  return (
    <article
      id="resume-print"
      className={`bg-white text-ink shadow-glow ${className}`}
    >
      <div className="border-b border-teal-900/10 px-8 py-7">
        <h2 className="font-display text-3xl tracking-tight text-teal-900">
          {content.fullName || "Your Name"}
        </h2>
        <p className="mt-1 text-base font-medium text-teal-700">
          {content.headline || "Headline"}
        </p>
        <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink/60">
          {content.email ? <span>{content.email}</span> : null}
          {content.phone ? <span>{content.phone}</span> : null}
          {content.location ? <span>{content.location}</span> : null}
          {content.links?.map((link) => (
            <span key={link.url}>{link.label}</span>
          ))}
        </p>
      </div>

      <div className="space-y-6 px-8 py-6 text-sm leading-relaxed">
        <section>
          <h3 className="mb-2 font-display text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">
            Summary
          </h3>
          <p className="text-ink/80">{content.summary || "Add a professional summary."}</p>
        </section>

        <section>
          <h3 className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">
            Experience
          </h3>
          <div className="space-y-4">
            {(content.experience || []).map((exp, idx) => (
              <div key={`${exp.company}-${idx}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <div className="font-semibold text-ink">{exp.title}</div>
                    <div className="text-ink/65">{exp.company}</div>
                  </div>
                  <div className="text-xs text-ink/45">
                    {exp.start} — {exp.end}
                  </div>
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-ink/80">
                  {exp.bullets.map((bullet, bIdx) => (
                    <li key={bIdx}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {(content.education || []).length > 0 ? (
          <section>
            <h3 className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">
              Education
            </h3>
            <div className="space-y-2">
              {content.education.map((edu, idx) => (
                <div key={`${edu.school}-${idx}`} className="flex justify-between gap-3">
                  <div>
                    <div className="font-semibold">{edu.degree}</div>
                    <div className="text-ink/65">{edu.school}</div>
                  </div>
                  <div className="text-xs text-ink/45">{edu.year}</div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <h3 className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">
            Skills
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {(content.skills || []).map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-sand-100 px-2 py-0.5 text-xs text-teal-900"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
