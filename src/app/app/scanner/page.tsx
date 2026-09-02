"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, Label, PageHeader } from "@/components/ui";

type ScanResult = {
  overall: number;
  match: {
    matchedSkills: string[];
    missingSkills: string[];
    keywordCoverage: number;
    tips: string[];
  };
  formattingIssues: string[];
  atsChecks: { label: string; pass: boolean }[];
  rewriteSuggestions: string[];
};

export default function ScannerPage() {
  const [resumes, setResumes] = useState<{ id: string; title: string }[]>([]);
  const [jobs, setJobs] = useState<{ id: string; title: string; company: string }[]>([]);
  const [resumeId, setResumeId] = useState("");
  const [jobId, setJobId] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/resumes").then((r) => r.json()),
      fetch("/api/jobs").then((r) => r.json()),
    ]).then(([r, j]) => {
      setResumes((r.resumes || []).map((x: { id: string; title: string }) => x));
      setJobs((j.jobs || []).slice(0, 50));
      if (r.resumes?.[0]) setResumeId(r.resumes[0].id);
    });
  }, []);

  async function scan() {
    setLoading(true);
    const res = await fetch("/api/resumes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "scan",
        resumeId,
        jobId: jobId || undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) setResult(data.result);
  }

  return (
    <div>
      <PageHeader
        title="ATS Resume Scanner"
        subtitle="Keyword gap analysis and formatting checks modeled after Jobscan-style workflows — before you apply."
      />
      <Card className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
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
        <div className="flex-1">
          <Label>Compare to job (optional)</Label>
          <select
            className="w-full rounded-xl border border-teal-900/10 bg-white px-3 py-2.5 text-sm"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
          >
            <option value="">Generic ATS check</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} @ {j.company}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={scan} disabled={loading || !resumeId}>
          {loading ? "Scanning…" : "Scan resume"}
        </Button>
      </Card>

      {result ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <div className="text-sm text-ink/55">Overall match</div>
            <div className="mt-2 font-display text-5xl text-teal-800">
              {result.overall}
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-sand-200">
              <div
                className="h-full bg-teal-800"
                style={{ width: `${result.overall}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-ink/60">
              Keyword coverage {result.match.keywordCoverage}%
            </p>
          </Card>
          <Card className="lg:col-span-2">
            <h3 className="font-display text-xl">Keyword heatmap</h3>
            <div className="mt-3">
              <div className="text-xs uppercase tracking-wider text-ink/45">Present</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.match.matchedSkills.map((s) => (
                  <Badge key={s} className="bg-emerald-100 text-emerald-900">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs uppercase tracking-wider text-ink/45">Missing</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.match.missingSkills.map((s) => (
                  <Badge key={s} className="bg-rose-100 text-rose-900">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
          <Card>
            <h3 className="font-display text-xl">ATS checks</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {result.atsChecks.map((c) => (
                <li key={c.label} className="flex justify-between gap-2">
                  <span>{c.label}</span>
                  <span className={c.pass ? "text-emerald-700" : "text-rose-700"}>
                    {c.pass ? "Pass" : "Fix"}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="lg:col-span-2">
            <h3 className="font-display text-xl">Rewrite suggestions</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink/75">
              {result.rewriteSuggestions.map((s) => (
                <li key={s}>{s}</li>
              ))}
              {result.match.tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
              {result.formattingIssues.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
