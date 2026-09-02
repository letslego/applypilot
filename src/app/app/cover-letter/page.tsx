"use client";

import { useEffect, useState } from "react";
import { Button, Card, Label, PageHeader, Textarea } from "@/components/ui";

export default function CoverLetterPage() {
  const [resumes, setResumes] = useState<{ id: string; title: string }[]>([]);
  const [jobs, setJobs] = useState<{ id: string; title: string; company: string }[]>([]);
  const [resumeId, setResumeId] = useState("");
  const [jobId, setJobId] = useState("");
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/resumes").then((r) => r.json()),
      fetch("/api/jobs").then((r) => r.json()),
    ]).then(([r, j]) => {
      setResumes((r.resumes || []).map((x: { id: string; title: string }) => ({
        id: x.id,
        title: x.title,
      })));
      setJobs(
        (j.jobs || []).slice(0, 50).map((x: { id: string; title: string; company: string }) => ({
          id: x.id,
          title: x.title,
          company: x.company,
        })),
      );
      if (r.resumes?.[0]) setResumeId(r.resumes[0].id);
      if (j.jobs?.[0]) setJobId(j.jobs[0].id);
    });
  }, []);

  async function generate() {
    setLoading(true);
    const res = await fetch("/api/resumes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cover-letter", resumeId, jobId }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) setLetter(data.coverLetter.content);
  }

  return (
    <div>
      <PageHeader
        title="AI Cover Letter"
        subtitle="Generate a tailored letter for each role in seconds, then edit the voice to sound like you."
      />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit space-y-3">
          <div>
            <Label>Resume</Label>
            <select
              className="w-full rounded-xl border border-teal-900/10 bg-white px-3 py-2.5 text-sm"
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Job</Label>
            <select
              className="w-full rounded-xl border border-teal-900/10 bg-white px-3 py-2.5 text-sm"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} @ {j.company}
                </option>
              ))}
            </select>
          </div>
          <Button className="w-full" onClick={generate} disabled={loading}>
            {loading ? "Writing…" : "Generate letter"}
          </Button>
        </Card>
        <Card>
          <Textarea
            rows={18}
            value={letter}
            onChange={(e) => setLetter(e.target.value)}
            placeholder="Your cover letter will appear here…"
          />
          <Button
            className="mt-3"
            variant="secondary"
            disabled={!letter}
            onClick={() => navigator.clipboard.writeText(letter)}
          >
            Copy
          </Button>
        </Card>
      </div>
    </div>
  );
}
