"use client";

import { useEffect, useState } from "react";
import { Badge, Card, PageHeader } from "@/components/ui";
import { formatDate, statusColor } from "@/lib/utils";

const COLUMNS = [
  "saved",
  "queued",
  "applied",
  "interview",
  "offer",
  "rejected",
] as const;

type AppRow = {
  id: string;
  status: string;
  matchScore: number;
  appliedAt: string | null;
  job: { title: string; company: string; location: string };
};

export default function TrackerPage() {
  const [apps, setApps] = useState<AppRow[]>([]);

  async function load() {
    const res = await fetch("/api/applications");
    const data = await res.json();
    if (res.ok) setApps(data.applications || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function move(id: string, status: string) {
    await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update-status", id, status }),
    });
    load();
  }

  return (
    <div>
      <PageHeader
        title="Application Tracker"
        subtitle="Teal-style Kanban pipeline — move roles from saved to offer without losing context."
      />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const items = apps.filter((a) => a.status === col);
          return (
            <div
              key={col}
              className="w-64 shrink-0 rounded-2xl border border-teal-900/8 bg-white/50 p-3"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold capitalize text-ink">{col}</h3>
                <Badge className="bg-sand-100 text-ink/70">{items.length}</Badge>
              </div>
              <div className="space-y-2">
                {items.map((a) => (
                  <Card key={a.id} className="p-3">
                    <div className="text-sm font-medium text-ink">{a.job.title}</div>
                    <div className="text-xs text-ink/55">
                      {a.job.company} · {a.matchScore}%
                    </div>
                    <div className="mt-1 text-[11px] text-ink/40">
                      {formatDate(a.appliedAt)}
                    </div>
                    <select
                      className="mt-2 w-full rounded-lg border border-teal-900/10 bg-white px-2 py-1 text-xs"
                      value={a.status}
                      onChange={(e) => move(a.id, e.target.value)}
                    >
                      {COLUMNS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <Badge className={`mt-2 ${statusColor(a.status)}`}>{a.status}</Badge>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
