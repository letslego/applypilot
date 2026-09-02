"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, PageHeader } from "@/components/ui";
import {
  DocumentsSelect,
  SkillHeatmap,
} from "@/components/documents-shared";
import type { MatchResult } from "@/lib/matching";
import {
  CheckCircle2,
  CircleAlert,
  Loader2,
  ScanSearch,
  Sparkles,
} from "lucide-react";

type ResumeRow = {
  id: string;
  title: string;
  isMaster: boolean;
};

type JobRow = {
  id: string;
  title: string;
  company: string;
  match?: { score: number } | null;
};

type AtsCheck = { label: string; pass: boolean };

type ScanResult = {
  overall: number;
  match: MatchResult;
  formattingIssues: string[];
  atsChecks: AtsCheck[];
  rewriteSuggestions: string[];
};

function scoreTone(score: number) {
  if (score >= 80) return "text-teal-800";
  if (score >= 60) return "text-amber-800";
  return "text-rose-800";
}

function scoreRing(score: number) {
  if (score >= 80) return "ring-teal-700/30 bg-teal-800/10";
  if (score >= 60) return "ring-amber-600/25 bg-amber-500/10";
  return "ring-rose-500/25 bg-rose-500/10";
}

export default function ScannerPage() {
  const [resumes, setResumes] = useState<ResumeRow[]>([]);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [resumeId, setResumeId] = useState("");
  const [jobId, setJobId] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [rRes, jRes] = await Promise.all([
          fetch("/api/resumes"),
          fetch("/api/jobs"),
        ]);
        if (!rRes.ok) throw new Error("Could not load resumes");
        const rData = await rRes.json();
        const resumeList = (rData.resumes || []) as ResumeRow[];
        setResumes(resumeList);
        const master = resumeList.find((r) => r.isMaster) || resumeList[0];
        if (master) setResumeId(master.id);

        if (jRes.ok) {
          const jData = await jRes.json();
          setJobs(((jData.jobs || []) as JobRow[]).slice(0, 50));
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  async function runScan() {
    if (!resumeId) {
      setError("Select a resume to scan");
      return;
    }
    setScanning(true);
    setError(null);
    try {
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
      if (!res.ok) throw new Error(data.error || "Scan failed");
      setResult(data.result as ScanResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-ink/55">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-teal-700" />
        Loading…
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="ATS Scanner"
        subtitle="See how an ATS reads your resume — keyword coverage, formatting checks, and rewrite tips."
        actions={
          <Button
            type="button"
            onClick={runScan}
            disabled={scanning || !resumeId}
          >
            {scanning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ScanSearch className="h-4 w-4" />
            )}
            Scan resume
          </Button>
        }
      />

      {error ? (
        <div className="mb-6 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-900 ring-1 ring-rose-200">
          {error}
        </div>
      ) : null}

      <Card className="mb-6">
        <div className="grid gap-4 md:grid-cols-2">
          <DocumentsSelect
            label="Resume"
            value={resumeId}
            onChange={setResumeId}
          >
            <option value="">Select resume…</option>
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
                {r.isMaster ? " (Master)" : ""}
              </option>
            ))}
          </DocumentsSelect>
          <DocumentsSelect
            label="Compare to job (optional)"
            value={jobId}
            onChange={setJobId}
          >
            <option value="">Generic software role baseline</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} @ {j.company}
                {j.match?.score != null ? ` · ${j.match.score}%` : ""}
              </option>
            ))}
          </DocumentsSelect>
        </div>
      </Card>

      {!result ? (
        <Card className="flex min-h-[280px] flex-col items-center justify-center text-center">
          <ScanSearch className="mb-3 h-9 w-9 text-teal-700/70" />
          <p className="font-display text-2xl text-ink">Run a scan</p>
          <p className="mt-2 max-w-md text-sm text-ink/55">
            Pick a resume and optionally a job posting. We&apos;ll score keyword
            overlap, surface ATS checks, and suggest rewrite moves.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <Card
            className={`flex flex-col items-center justify-center text-center ${scoreRing(result.overall)} ring-1`}
          >
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-ink/50">
              Overall score
            </div>
            <div
              className={`mt-2 font-display text-6xl tracking-tight ${scoreTone(result.overall)}`}
            >
              {result.overall}
            </div>
            <div className="mt-1 text-sm text-ink/55">out of 100</div>
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              <Badge className="bg-white/80 text-ink/70 ring-1 ring-teal-900/10">
                Keywords {result.match.keywordCoverage}%
              </Badge>
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="font-display text-lg text-ink">
                  Keyword heatmap
                </h2>
                <span className="text-xs text-ink/45">
                  {result.match.matchedSkills.length} matched ·{" "}
                  {result.match.missingSkills.length} missing
                </span>
              </div>
              <SkillHeatmap
                matched={result.match.matchedSkills}
                missing={result.match.missingSkills}
              />
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <h2 className="mb-4 font-display text-lg text-ink">ATS checks</h2>
                <ul className="space-y-2.5">
                  {result.atsChecks.map((check) => (
                    <li
                      key={check.label}
                      className="flex items-start gap-2.5 text-sm"
                    >
                      {check.pass ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                      ) : (
                        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                      )}
                      <span className={check.pass ? "text-ink/80" : "text-ink"}>
                        {check.label}
                      </span>
                    </li>
                  ))}
                </ul>
                {result.formattingIssues.length > 0 ? (
                  <div className="mt-4 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-950 ring-1 ring-amber-700/15">
                    <div className="mb-1 font-medium">Formatting notes</div>
                    <ul className="list-disc space-y-1 pl-4">
                      {result.formattingIssues.map((issue) => (
                        <li key={issue}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </Card>

              <Card>
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-teal-700" />
                  <h2 className="font-display text-lg text-ink">
                    Rewrite suggestions
                  </h2>
                </div>
                {result.rewriteSuggestions.length === 0 ? (
                  <p className="text-sm text-ink/55">
                    Strong coverage — polish quantified bullets and apply.
                  </p>
                ) : (
                  <ol className="space-y-3">
                    {result.rewriteSuggestions.map((tip, idx) => (
                      <li
                        key={tip}
                        className="rounded-xl bg-sand-50/90 px-3 py-2.5 text-sm text-ink/80 ring-1 ring-teal-900/5"
                      >
                        <span className="mr-2 font-display text-teal-800">
                          {idx + 1}.
                        </span>
                        {tip}
                      </li>
                    ))}
                  </ol>
                )}
                {result.match.tips.length > 0 ? (
                  <div className="mt-4 space-y-1.5 border-t border-teal-900/8 pt-4">
                    {result.match.tips.map((tip) => (
                      <p key={tip} className="text-sm text-ink/60">
                        {tip}
                      </p>
                    ))}
                  </div>
                ) : null}
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
