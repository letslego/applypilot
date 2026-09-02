"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MatchBadge } from "@/components/jobs-match-badge";
import { Badge, Card, PageHeader } from "@/components/ui";
import { cn, formatSalary } from "@/lib/utils";

const COLUMNS = [
  { id: "saved", label: "Saved" },
  { id: "queued", label: "Queued" },
  { id: "applied", label: "Applied" },
  { id: "interview", label: "Interview" },
  { id: "offer", label: "Offer" },
  { id: "rejected", label: "Rejected" },
] as const;

type Status = (typeof COLUMNS)[number]["id"];

type ApplicationRow = {
  id: string;
  status: string;
  matchScore: number;
  mode?: string;
  job: {
    id: string;
    title: string;
    company: string;
    location?: string;
    remoteType?: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    currency?: string;
  };
};

export default function TrackerPage() {
  const [apps, setApps] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<Status | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/applications");
    if (!res.ok) {
      setError("Could not load applications.");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setApps(data.applications || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const byStatus = useMemo(() => {
    const map: Record<Status, ApplicationRow[]> = {
      saved: [],
      queued: [],
      applied: [],
      interview: [],
      offer: [],
      rejected: [],
    };
    for (const app of apps) {
      const status = (COLUMNS.some((c) => c.id === app.status)
        ? app.status
        : "saved") as Status;
      map[status].push(app);
    }
    return map;
  }, [apps]);

  async function updateStatus(id: string, status: Status) {
    const prev = apps;
    setMovingId(id);
    setApps((list) =>
      list.map((a) => (a.id === id ? { ...a, status } : a)),
    );
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-status", id, status }),
      });
      if (!res.ok) {
        setApps(prev);
        setError("Failed to update status.");
        return;
      }
    } finally {
      setMovingId(null);
      setDragOver(null);
    }
  }

  function onDrop(status: Status, e: React.DragEvent) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/app-id");
    if (!id) return;
    const app = apps.find((a) => a.id === id);
    if (!app || app.status === status) {
      setDragOver(null);
      return;
    }
    void updateStatus(id, status);
  }

  if (loading) {
    return <p className="text-sm text-ink/55">Loading tracker…</p>;
  }

  return (
    <div>
      <PageHeader
        title="Application tracker"
        subtitle="Kanban pipeline from saved to offer. Drag cards or use the status menu to move applications."
      />

      {error ? (
        <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      ) : null}

      {apps.length === 0 ? (
        <Card>
          <p className="text-ink/65">
            No applications yet.{" "}
            <Link href="/app/jobs" className="text-teal-800 underline">
              Browse the job board
            </Link>{" "}
            to save or apply.
          </p>
        </Card>
      ) : (
        <div className="-mx-2 overflow-x-auto pb-4">
          <div className="flex min-w-max gap-3 px-2">
            {COLUMNS.map((col) => (
              <div
                key={col.id}
                className={cn(
                  "flex w-64 shrink-0 flex-col rounded-2xl border border-teal-900/8 bg-white/40 p-3 transition",
                  dragOver === col.id && "border-teal-700/40 bg-teal-50/50",
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(col.id);
                }}
                onDragLeave={() =>
                  setDragOver((cur) => (cur === col.id ? null : cur))
                }
                onDrop={(e) => onDrop(col.id, e)}
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="font-display text-lg text-ink">{col.label}</h2>
                  <Badge className="bg-sand-100 text-ink/60">
                    {byStatus[col.id].length}
                  </Badge>
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  {byStatus[col.id].map((app) => (
                    <div
                      key={app.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/app-id", app.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      className={cn(
                        "cursor-grab rounded-xl border border-teal-900/8 bg-white/90 p-3 shadow-sm active:cursor-grabbing",
                        movingId === app.id && "opacity-60",
                      )}
                    >
                      <Link
                        href={`/app/jobs/${app.job.id}`}
                        className="font-medium text-ink hover:text-teal-800"
                      >
                        {app.job.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-ink/55">
                        {app.job.company}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <MatchBadge score={app.matchScore || null} />
                        {app.mode ? (
                          <Badge className="bg-teal-900/5 capitalize text-ink/55">
                            {app.mode}
                          </Badge>
                        ) : null}
                      </div>
                      {app.job.salaryMin || app.job.salaryMax ? (
                        <p className="mt-2 text-xs text-teal-800">
                          {formatSalary(
                            app.job.salaryMin,
                            app.job.salaryMax,
                            app.job.currency,
                          )}
                        </p>
                      ) : null}
                      <label className="mt-3 block text-[11px] uppercase tracking-wide text-ink/40">
                        Move to
                        <select
                          className="mt-1 w-full rounded-lg border border-teal-900/10 bg-sand-50 px-2 py-1.5 text-xs capitalize text-ink outline-none focus:border-teal-700"
                          value={app.status}
                          disabled={movingId === app.id}
                          onChange={(e) =>
                            void updateStatus(app.id, e.target.value as Status)
                          }
                        >
                          {COLUMNS.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  ))}
                  {byStatus[col.id].length === 0 ? (
                    <p className="px-1 py-6 text-center text-xs text-ink/35">
                      Drop here
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
