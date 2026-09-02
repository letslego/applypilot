"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Label,
  PageHeader,
  Textarea,
} from "@/components/ui";
import { DocumentsSelect } from "@/components/documents-shared";
import type { ResumeContent } from "@/data/demo-resume";
import { Check, Copy, Loader2, Mail, Sparkles } from "lucide-react";

type ResumeRow = {
  id: string;
  title: string;
  isMaster: boolean;
  content: ResumeContent;
};

type JobRow = {
  id: string;
  title: string;
  company: string;
  match?: { score: number } | null;
};

type CoverLetterRow = {
  id: string;
  title: string;
  content: string;
};

export default function CoverLetterPage() {
  const [resumes, setResumes] = useState<ResumeRow[]>([]);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [resumeId, setResumeId] = useState("");
  const [jobId, setJobId] = useState("");
  const [letter, setLetter] = useState("");
  const [letterTitle, setLetterTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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
        if (!jRes.ok) throw new Error("Could not load jobs");
        const rData = await rRes.json();
        const jData = await jRes.json();
        const resumeList = (rData.resumes || []) as ResumeRow[];
        const jobList = (jData.jobs || []) as JobRow[];
        setResumes(resumeList);
        setJobs(jobList.slice(0, 50));
        const master = resumeList.find((r) => r.isMaster) || resumeList[0];
        if (master) setResumeId(master.id);
        if (jobList[0]) setJobId(jobList[0].id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const selectedJob = jobs.find((j) => j.id === jobId);
  const selectedResume = resumes.find((r) => r.id === resumeId);

  async function generate() {
    if (!resumeId || !jobId) {
      setError("Select a resume and a job first");
      return;
    }
    setGenerating(true);
    setError(null);
    setMessage(null);
    setCopied(false);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cover-letter",
          resumeId,
          jobId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      const created = data.coverLetter as CoverLetterRow;
      setLetter(created.content);
      setLetterTitle(created.title);
      setMessage("Cover letter ready — edit freely before you copy.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function copyLetter() {
    if (!letter) return;
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Clipboard unavailable — select the text manually");
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
        title="Cover Letters"
        subtitle="Pair a resume with a role and generate a specific, editable letter — no generic templates."
        actions={
          <Button
            type="button"
            onClick={generate}
            disabled={generating || !resumeId || !jobId}
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate
          </Button>
        }
      />

      {(message || error) && (
        <div
          className={`mb-6 rounded-xl px-4 py-3 text-sm ${
            error
              ? "bg-rose-50 text-rose-900 ring-1 ring-rose-200"
              : "bg-teal-800/10 text-teal-900 ring-1 ring-teal-800/15"
          }`}
        >
          {error || message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <Mail className="h-4 w-4 text-teal-700" />
              <h2 className="font-display text-lg text-ink">Inputs</h2>
            </div>
            <div className="space-y-4">
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

              <DocumentsSelect label="Job" value={jobId} onChange={setJobId}>
                <option value="">Select job…</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} @ {j.company}
                    {j.match?.score != null ? ` · ${j.match.score}%` : ""}
                  </option>
                ))}
              </DocumentsSelect>
            </div>

            {selectedJob || selectedResume ? (
              <div className="mt-5 space-y-3 rounded-xl bg-sand-50/90 p-3 ring-1 ring-teal-900/5">
                {selectedResume ? (
                  <div>
                    <div className="text-xs uppercase tracking-wider text-ink/45">
                      From resume
                    </div>
                    <div className="mt-1 text-sm font-medium text-ink">
                      {selectedResume.content.fullName}
                    </div>
                    <div className="text-sm text-ink/60">
                      {selectedResume.content.headline}
                    </div>
                  </div>
                ) : null}
                {selectedJob ? (
                  <div>
                    <div className="text-xs uppercase tracking-wider text-ink/45">
                      Targeting
                    </div>
                    <div className="mt-1 text-sm font-medium text-ink">
                      {selectedJob.title}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-ink/60">
                      {selectedJob.company}
                      {selectedJob.match?.score != null ? (
                        <Badge className="bg-teal-800/10 text-teal-900">
                          {selectedJob.match.score}% match
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </Card>
        </div>

        <Card className="min-h-[420px]">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg text-ink">
                {letterTitle || "Letter draft"}
              </h2>
              <p className="text-sm text-ink/55">
                Edit the tone, then copy into your application.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={copyLetter}
              disabled={!letter}
            >
              {copied ? (
                <Check className="h-4 w-4 text-teal-700" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>

          {letter ? (
            <>
              <Label>Letter body</Label>
              <Textarea
                rows={18}
                value={letter}
                onChange={(e) => setLetter(e.target.value)}
                className="mt-1 font-body leading-relaxed"
              />
            </>
          ) : (
            <div className="flex h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-teal-900/15 bg-sand-50/50 px-6 text-center">
              <Sparkles className="mb-3 h-8 w-8 text-teal-700/70" />
              <p className="font-display text-xl text-ink">No letter yet</p>
              <p className="mt-2 max-w-sm text-sm text-ink/55">
                Choose a resume and job, then hit Generate. The letter stays
                editable so you can keep your voice.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
