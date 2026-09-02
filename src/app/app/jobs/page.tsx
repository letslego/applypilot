"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, Button, Card, Input, Label, PageHeader } from "@/components/ui";
import { formatSalary } from "@/lib/utils";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  remoteType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  seniority: string | null;
  department: string | null;
  match: { score: number } | null;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [q, setQ] = useState("");
  const [remote, setRemote] = useState("");
  const [seniority, setSeniority] = useState("");
  const [loading, setLoading] = useState(true);

  async function load(params?: { q?: string; remote?: string; seniority?: string }) {
    setLoading(true);
    const sp = new URLSearchParams();
    if (params?.q) sp.set("q", params.q);
    if (params?.remote) sp.set("remote", params.remote);
    if (params?.seniority) sp.set("seniority", params.seniority);
    const res = await fetch(`/api/jobs?${sp.toString()}`);
    const data = await res.json();
    setJobs(data.jobs || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <PageHeader
        title="Job Board"
        subtitle="90+ live seeded roles with match scores against your master resume."
      />
      <Card className="mb-6 grid gap-3 md:grid-cols-4">
        <div className="md:col-span-2">
          <Label>Search</Label>
          <Input
            placeholder="Title, company, skill…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") load({ q, remote, seniority });
            }}
          />
        </div>
        <div>
          <Label>Remote type</Label>
          <select
            className="w-full rounded-xl border border-teal-900/10 bg-white px-3 py-2.5 text-sm"
            value={remote}
            onChange={(e) => setRemote(e.target.value)}
          >
            <option value="">Any</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </select>
        </div>
        <div>
          <Label>Seniority</Label>
          <select
            className="w-full rounded-xl border border-teal-900/10 bg-white px-3 py-2.5 text-sm"
            value={seniority}
            onChange={(e) => setSeniority(e.target.value)}
          >
            <option value="">Any</option>
            <option value="Mid">Mid</option>
            <option value="Senior">Senior</option>
            <option value="Staff">Staff</option>
            <option value="Manager">Manager</option>
          </select>
        </div>
        <div className="md:col-span-4">
          <Button onClick={() => load({ q, remote, seniority })}>Apply filters</Button>
        </div>
      </Card>

      {loading ? (
        <p className="text-ink/55">Loading jobs…</p>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Link key={job.id} href={`/app/jobs/${job.id}`}>
              <Card className="transition hover:border-teal-800/30 hover:shadow-md">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-2xl text-ink">{job.title}</h3>
                    <p className="text-ink/60">
                      {job.company} · {job.location} · {job.remoteType}
                    </p>
                    <p className="mt-1 text-sm text-ink/50">
                      {formatSalary(job.salaryMin, job.salaryMax)}
                      {job.seniority ? ` · ${job.seniority}` : ""}
                      {job.department ? ` · ${job.department}` : ""}
                    </p>
                  </div>
                  {job.match ? (
                    <Badge className="bg-teal-800 text-sand-50">
                      {job.match.score}% match
                    </Badge>
                  ) : null}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
