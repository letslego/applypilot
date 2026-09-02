"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge, Button, Card, PageHeader } from "@/components/ui";
import { formatSalary } from "@/lib/utils";

export default function JobDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<{
    job: {
      id: string;
      title: string;
      company: string;
      location: string;
      remoteType: string;
      salaryMin: number | null;
      salaryMax: number | null;
      description: string;
      requirements: string[];
      skills: string[];
      source: string;
    };
    match: {
      score: number;
      matchedSkills: string[];
      missingSkills: string[];
      tips: string[];
    } | null;
    brief: {
      summary: string;
      cultureSignals: string[];
      talkTracks: string[];
      risks: string[];
    };
  } | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then((r) => r.json())
      .then(setData);
  }, [id]);

  async function apply(mode: string) {
    setMsg(mode === "manual" ? "Submitting…" : "Queuing…");
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "apply", jobId: id, mode }),
    });
    const body = await res.json();
    setMsg(res.ok ? `Application ${body.application.status}` : body.error || "Failed");
  }

  async function save() {
    await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save", jobId: id }),
    });
    setMsg("Saved to tracker");
  }

  if (!data?.job) return <p className="text-ink/55">Loading…</p>;
  const { job, match, brief } = data;

  return (
    <div>
      <PageHeader
        title={job.title}
        subtitle={`${job.company} · ${job.location} · ${job.remoteType} · ${formatSalary(job.salaryMin, job.salaryMax)}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/app/jobs">
              <Button variant="ghost">Back</Button>
            </Link>
            <Button variant="secondary" onClick={save}>
              Save
            </Button>
            <Button onClick={() => apply("manual")}>Apply now</Button>
          </div>
        }
      />

      {msg ? <p className="mb-4 text-sm text-teal-800">{msg}</p> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="font-display text-xl">Description</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink/75">
              {job.description}
            </p>
          </div>
          <div>
            <h3 className="font-display text-xl">Requirements</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink/75">
              {job.requirements.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((s) => (
              <Badge key={s} className="bg-teal-800/10 text-teal-900">
                {s}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-ink/40">Source: {job.source}</p>
        </Card>

        <div className="space-y-6">
          {match ? (
            <Card>
              <div className="text-sm text-ink/55">Your match</div>
              <div className="font-display text-4xl text-teal-800">{match.score}%</div>
              <div className="mt-3 text-xs uppercase tracking-wider text-ink/45">
                Missing
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {match.missingSkills.map((s) => (
                  <Badge key={s} className="bg-rose-100 text-rose-900">
                    {s}
                  </Badge>
                ))}
              </div>
              <ul className="mt-3 list-disc pl-4 text-sm text-ink/65">
                {match.tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <Button
                className="mt-4 w-full"
                variant="secondary"
                onClick={() => apply("hybrid")}
              >
                Queue via Auto-Apply (1 credit)
              </Button>
            </Card>
          ) : null}
          <Card>
            <h3 className="font-display text-xl">Company brief</h3>
            <p className="mt-2 text-sm text-ink/70">{brief.summary}</p>
            <h4 className="mt-4 text-xs uppercase tracking-wider text-ink/45">
              Talk tracks
            </h4>
            <ul className="mt-1 list-disc pl-4 text-sm text-ink/70">
              {brief.talkTracks.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
