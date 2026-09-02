"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button, Input, Label, PageHeader, Card } from "@/components/ui";
import { JobCard, type JobListItem } from "@/components/jobs-card";

const REMOTE_OPTIONS = [
  { value: "", label: "Any work mode" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "Onsite" },
];

const SENIORITY_OPTIONS = [
  { value: "", label: "Any seniority" },
  { value: "Mid", label: "Mid" },
  { value: "Senior", label: "Senior" },
  { value: "Staff", label: "Staff" },
  { value: "Manager", label: "Manager" },
];

export default function JobsPage() {
  const [q, setQ] = useState("");
  const [remote, setRemote] = useState("");
  const [seniority, setSeniority] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  const loadJobs = useCallback(async (params?: {
    q?: string;
    remote?: string;
    seniority?: string;
    minSalary?: string;
  }) => {
    setError(null);
    const sp = new URLSearchParams();
    const query = params?.q ?? q;
    const rem = params?.remote ?? remote;
    const sen = params?.seniority ?? seniority;
    const sal = params?.minSalary ?? minSalary;
    if (query.trim()) sp.set("q", query.trim());
    if (rem) sp.set("remote", rem);
    if (sen) sp.set("seniority", sen);
    if (sal) sp.set("minSalary", sal);

    const res = await fetch(`/api/jobs?${sp.toString()}`);
    if (!res.ok) {
      setError("Could not load jobs. Try again.");
      setJobs([]);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setJobs(data.jobs || []);
    setLoading(false);
  }, [q, remote, seniority, minSalary]);

  useEffect(() => {
    void loadJobs();
    // initial load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    startTransition(() => {
      void loadJobs();
    });
  }

  function clearFilters() {
    setQ("");
    setRemote("");
    setSeniority("");
    setMinSalary("");
    startTransition(() => {
      void loadJobs({ q: "", remote: "", seniority: "", minSalary: "" });
    });
  }

  return (
    <div>
      <PageHeader
        title="Job board"
        subtitle="Search roles matched to your master resume. Filter by remote mode, seniority, and salary floor."
      />

      <Card className="mb-8">
        <form onSubmit={onSearch} className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1">
              <Label>Search</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
                <Input
                  className="pl-9"
                  placeholder="Title, company, skill, or location"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={pending || loading}>
                {pending ? "Searching…" : "Search"}
              </Button>
              <Button type="button" variant="secondary" onClick={clearFilters}>
                Clear
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label>
                <span className="inline-flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Remote
                </span>
              </Label>
              <select
                className="w-full rounded-xl border border-teal-900/10 bg-white/90 px-3 py-2.5 text-sm text-ink outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                value={remote}
                onChange={(e) => setRemote(e.target.value)}
              >
                {REMOTE_OPTIONS.map((o) => (
                  <option key={o.value || "any"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Seniority</Label>
              <select
                className="w-full rounded-xl border border-teal-900/10 bg-white/90 px-3 py-2.5 text-sm text-ink outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                value={seniority}
                onChange={(e) => setSeniority(e.target.value)}
              >
                {SENIORITY_OPTIONS.map((o) => (
                  <option key={o.value || "any"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Min salary</Label>
              <Input
                type="number"
                min={0}
                step={5000}
                placeholder="e.g. 120000"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
              />
            </div>
          </div>
        </form>
      </Card>

      {error ? (
        <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-ink/55">Loading jobs…</p>
      ) : jobs.length === 0 ? (
        <Card>
          <p className="text-ink/65">No roles matched those filters.</p>
        </Card>
      ) : (
        <>
          <p className="mb-4 text-sm text-ink/55">
            {jobs.length} role{jobs.length === 1 ? "" : "s"} · sorted by match
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
