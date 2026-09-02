"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Bookmark,
  Send,
  Lightbulb,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  PageHeader,
} from "@/components/ui";
import { MatchBadge } from "@/components/jobs-match-badge";
import { formatSalary, formatDate } from "@/lib/utils";

type MatchResult = {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  keywordCoverage: number;
  tips: string[];
};

type JobDetail = {
  id: string;
  title: string;
  company: string;
  location: string;
  remoteType: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string;
  seniority?: string | null;
  department?: string | null;
  description: string;
  requirements: string[];
  skills: string[];
  source?: string;
  postedAt?: string;
};

type Brief = {
  company: string;
  title: string;
  summary: string;
  cultureSignals: string[];
  talkTracks: string[];
  risks: string[];
};

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<"save" | "apply" | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/jobs/${id}`);
      if (!res.ok) {
        if (!cancelled) {
          setError(res.status === 404 ? "Job not found." : "Failed to load job.");
          setLoading(false);
        }
        return;
      }
      const data = await res.json();
      if (!cancelled) {
        setJob(data.job);
        setMatch(data.match);
        setBrief(data.brief);
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function act(action: "save" | "apply") {
    setBusy(action);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          jobId: id,
          mode: action === "apply" ? "manual" : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Could not ${action}.`);
        return;
      }
      setMessage(
        action === "save"
          ? "Saved to your tracker."
          : "Applied (manual). Tailored resume + cover letter generated.",
      );
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-ink/55">Loading job…</p>;
  }

  if (!job) {
    return (
      <div>
        <Link
          href="/app/jobs"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-teal-800 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to jobs
        </Link>
        <p className="text-rose-800">{error || "Job not found."}</p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/app/jobs"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-teal-800 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to jobs
      </Link>

      <PageHeader
        title={job.title}
        subtitle={`${job.company} · ${job.location}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => void act("save")}
              disabled={busy !== null}
            >
              <Bookmark className="h-4 w-4" />
              {busy === "save" ? "Saving…" : "Save"}
            </Button>
            <Button onClick={() => void act("apply")} disabled={busy !== null}>
              <Send className="h-4 w-4" />
              {busy === "apply" ? "Applying…" : "Apply (manual)"}
            </Button>
          </div>
        }
      />

      {message ? (
        <p className="mb-4 rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-900">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      ) : null}

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <MatchBadge score={match?.score} />
        <Badge className="bg-sand-100 capitalize text-ink/70">{job.remoteType}</Badge>
        {job.seniority ? (
          <Badge className="bg-teal-900/5 capitalize text-ink/70">
            {job.seniority}
          </Badge>
        ) : null}
        {job.department ? (
          <Badge className="bg-white text-ink/60">{job.department}</Badge>
        ) : null}
        <span className="text-sm font-medium text-teal-800">
          {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
        </span>
        <span className="text-xs text-ink/45">
          Posted {formatDate(job.postedAt)}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h2 className="font-display text-xl text-ink">Description</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink/75">
              {job.description}
            </p>
          </Card>

          <Card>
            <h2 className="font-display text-xl text-ink">Requirements</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink/75">
              {(job.requirements || []).map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            {job.skills?.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {job.skills.map((s) => (
                  <Badge key={s} className="bg-teal-900/5 text-ink/70">
                    {s}
                  </Badge>
                ))}
              </div>
            ) : null}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-xl text-ink">Match breakdown</h2>
              <MatchBadge score={match?.score} />
            </div>
            {match ? (
              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <div className="mb-1 flex justify-between text-ink/60">
                    <span>Keyword coverage</span>
                    <span>{match.keywordCoverage}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-sand-100">
                    <div
                      className="h-full rounded-full bg-teal-700"
                      style={{ width: `${match.keywordCoverage}%` }}
                    />
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 font-medium text-ink/80">Matched skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {match.matchedSkills.length ? (
                      match.matchedSkills.map((s) => (
                        <Badge key={s} className="bg-teal-100 text-teal-900">
                          {s}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-ink/45">None yet</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 font-medium text-ink/80">Missing skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {match.missingSkills.length ? (
                      match.missingSkills.map((s) => (
                        <Badge key={s} className="bg-amber-50 text-amber-900">
                          {s}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-ink/45">All covered</span>
                    )}
                  </div>
                </div>
                {match.tips?.length ? (
                  <ul className="space-y-1.5 text-ink/65">
                    {match.tips.map((t) => (
                      <li key={t} className="flex gap-2">
                        <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-700" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-sm text-ink/55">
                Add a master resume to see your match score for this role.
              </p>
            )}
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-teal-800" />
              <h2 className="font-display text-xl text-ink">Company research</h2>
            </div>
            {brief ? (
              <div className="mt-3 space-y-4 text-sm text-ink/75">
                <p>{brief.summary}</p>
                <div>
                  <p className="mb-1 font-medium text-ink/85">Culture signals</p>
                  <ul className="list-disc space-y-1 pl-4">
                    {brief.cultureSignals.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-1 font-medium text-ink/85">Talk tracks</p>
                  <ul className="list-disc space-y-1 pl-4">
                    {brief.talkTracks.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-1 font-medium text-ink/85">Watch-outs</p>
                  <ul className="list-disc space-y-1 pl-4">
                    {brief.risks.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
            <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-ink/45">
              <MapPin className="h-3 w-3" />
              {job.location} · {job.source || "ApplyPilot Board"}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
