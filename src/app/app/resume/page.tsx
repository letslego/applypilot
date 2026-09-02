"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Input,
  Label,
  PageHeader,
  Textarea,
} from "@/components/ui";
import type { ResumeContent } from "@/data/demo-resume";

type ResumeRow = {
  id: string;
  title: string;
  isMaster: boolean;
  language: string;
  content: ResumeContent;
};

type JobRow = { id: string; title: string; company: string };

export default function ResumePage() {
  const [resumes, setResumes] = useState<ResumeRow[]>([]);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<ResumeContent | null>(null);
  const [jobId, setJobId] = useState("");
  const [lang, setLang] = useState("es");
  const [status, setStatus] = useState("");

  async function load() {
    const [r, j] = await Promise.all([
      fetch("/api/resumes").then((x) => x.json()),
      fetch("/api/jobs").then((x) => x.json()),
    ]);
    setResumes(r.resumes || []);
    setJobs((j.jobs || []).slice(0, 40));
    if (!selectedId && r.resumes?.[0]) {
      select(r.resumes[0]);
    }
  }

  function select(r: ResumeRow) {
    setSelectedId(r.id);
    setTitle(r.title);
    setContent(r.content);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    if (!content) return;
    setStatus("Saving…");
    await fetch("/api/resumes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save", id: selectedId, title, content }),
    });
    setStatus("Saved");
    load();
  }

  async function tailor() {
    if (!selectedId || !jobId) return;
    setStatus("Tailoring…");
    const res = await fetch("/api/resumes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "tailor", resumeId: selectedId, jobId }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus("Tailored variant created");
      await load();
      select({ ...data.resume, content: data.resume.content });
    }
  }

  async function translate() {
    if (!selectedId) return;
    setStatus("Translating…");
    const res = await fetch("/api/resumes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "translate",
        resumeId: selectedId,
        language: lang,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus(`Created ${lang.toUpperCase()} variant`);
      await load();
      select({ ...data.resume, content: data.resume.content });
    }
  }

  if (!content) {
    return <p className="text-ink/60">Loading resumes…</p>;
  }

  return (
    <div>
      <PageHeader
        title="AI Resume Builder"
        subtitle="Edit your master resume, tailor per role, translate, and print an ATS-friendly PDF."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => window.print()}>
              Print / PDF
            </Button>
            <Button onClick={save}>Save</Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {resumes.map((r) => (
          <button
            key={r.id}
            onClick={() => select(r)}
            className={`rounded-xl px-3 py-1.5 text-sm ${
              selectedId === r.id
                ? "bg-teal-800 text-sand-50"
                : "bg-white/70 text-ink hover:bg-white"
            }`}
          >
            {r.title}
            {r.isMaster ? " ★" : ""}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-3">
          <div>
            <Label>Resume title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Full name</Label>
              <Input
                value={content.fullName}
                onChange={(e) =>
                  setContent({ ...content, fullName: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Headline</Label>
              <Input
                value={content.headline}
                onChange={(e) =>
                  setContent({ ...content, headline: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <Label>Summary</Label>
            <Textarea
              rows={4}
              value={content.summary}
              onChange={(e) =>
                setContent({ ...content, summary: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Skills (comma-separated)</Label>
            <Input
              value={content.skills.join(", ")}
              onChange={(e) =>
                setContent({
                  ...content,
                  skills: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
          <div>
            <Label>Experience (JSON-ish bullets editable as text blocks)</Label>
            {content.experience.map((exp, idx) => (
              <div key={idx} className="mt-2 rounded-xl bg-sand-50 p-3">
                <Input
                  className="mb-2"
                  value={`${exp.title} @ ${exp.company}`}
                  onChange={(e) => {
                    const [t, c] = e.target.value.split("@");
                    const next = [...content.experience];
                    next[idx] = {
                      ...exp,
                      title: (t || "").trim(),
                      company: (c || "").trim(),
                    };
                    setContent({ ...content, experience: next });
                  }}
                />
                <Textarea
                  rows={4}
                  value={exp.bullets.join("\n")}
                  onChange={(e) => {
                    const next = [...content.experience];
                    next[idx] = {
                      ...exp,
                      bullets: e.target.value.split("\n").filter(Boolean),
                    };
                    setContent({ ...content, experience: next });
                  }}
                />
              </div>
            ))}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <Label>Tailor for job</Label>
              <select
                className="w-full rounded-xl border border-teal-900/10 bg-white px-3 py-2.5 text-sm"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
              >
                <option value="">Select job…</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} @ {j.company}
                  </option>
                ))}
              </select>
              <Button className="mt-2 w-full" variant="secondary" onClick={tailor}>
                Tailor with AI
              </Button>
            </div>
            <div>
              <Label>Translate</Label>
              <select
                className="w-full rounded-xl border border-teal-900/10 bg-white px-3 py-2.5 text-sm"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
              >
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="pt">Portuguese</option>
              </select>
              <Button className="mt-2 w-full" variant="secondary" onClick={translate}>
                Create translation
              </Button>
            </div>
          </div>
          {status ? <p className="text-sm text-teal-800">{status}</p> : null}
        </Card>

        <Card>
          <div id="resume-print" className="space-y-4 text-ink">
            <div>
              <h2 className="font-display text-3xl">{content.fullName}</h2>
              <p className="text-teal-800">{content.headline}</p>
              <p className="mt-1 text-sm text-ink/60">
                {content.email} · {content.phone} · {content.location}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink/45">
                Summary
              </h3>
              <p className="mt-1 text-sm leading-relaxed">{content.summary}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink/45">
                Experience
              </h3>
              {content.experience.map((exp, i) => (
                <div key={i} className="mt-3">
                  <div className="flex justify-between gap-2 text-sm font-semibold">
                    <span>
                      {exp.title} · {exp.company}
                    </span>
                    <span className="text-ink/45">
                      {exp.start}–{exp.end}
                    </span>
                  </div>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink/80">
                    {exp.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink/45">
                Skills
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {content.skills.map((s) => (
                  <Badge key={s} className="bg-teal-800/10 text-teal-900">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
