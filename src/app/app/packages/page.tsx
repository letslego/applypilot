"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, PackageCheck } from "lucide-react";
import { Badge, Button, Card, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/utils";

type ApplyPkg = {
  id: string;
  status: string;
  applyUrl: string | null;
  coverLetter: string;
  createdAt: string;
  application: {
    matchScore: number;
    status: string;
    job: { title: string; company: string; location: string };
  };
};

export default function PackagesPage() {
  const [packages, setPackages] = useState<ApplyPkg[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/apply-packages");
    if (res.ok) {
      const data = await res.json();
      setPackages(data.packages || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function mark(id: string, action: "mark-opened" | "mark-submitted") {
    await fetch("/api/apply-packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id }),
    });
    await refresh();
  }

  const active = packages.find((p) => p.id === activeId) || packages[0];

  if (loading) return <p className="text-sm text-ink/55">Loading packages…</p>;

  return (
    <div>
      <PageHeader
        title="Apply packages"
        subtitle="Tailored resume, cover letter, and employer apply link — confirm submit on the employer site."
      />
      {packages.length === 0 ? (
        <Card>
          <p className="text-ink/65">
            No packages yet. Run Auto-Apply to generate employer-ready packages.
          </p>
          <a href="/app/auto-apply" className="mt-3 inline-block text-sm text-teal-800 underline">
            Go to Auto-Apply
          </a>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1 space-y-2">
            {packages.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveId(p.id)}
                className={`w-full rounded-xl border px-3 py-3 text-left text-sm transition ${
                  (active?.id || "") === p.id
                    ? "border-teal-800 bg-teal-50"
                    : "border-teal-900/10 hover:bg-white/70"
                }`}
              >
                <div className="font-medium text-ink">{p.application.job.title}</div>
                <div className="text-ink/55">{p.application.job.company}</div>
                <div className="mt-1 flex gap-2">
                  <Badge className="bg-teal-100 text-teal-900">
                    {p.application.matchScore}%
                  </Badge>
                  <Badge className="bg-sand-100 capitalize text-ink/70">{p.status}</Badge>
                </div>
              </button>
            ))}
          </Card>
          {active ? (
            <Card className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl text-ink">
                    {active.application.job.title}
                  </h2>
                  <p className="text-ink/60">
                    {active.application.job.company} · {active.application.job.location}
                  </p>
                  <p className="mt-1 text-xs text-ink/45">
                    Created {formatDate(active.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {active.applyUrl ? (
                    <a
                      href={active.applyUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => void mark(active.id, "mark-opened")}
                    >
                      <Button>
                        <ExternalLink className="h-4 w-4" />
                        Open employer apply
                      </Button>
                    </a>
                  ) : null}
                  <Button
                    variant="secondary"
                    onClick={() => void mark(active.id, "mark-submitted")}
                    disabled={active.status === "submitted"}
                  >
                    <PackageCheck className="h-4 w-4" />
                    Mark submitted
                  </Button>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
                  Cover letter
                </h3>
                <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-white/70 p-4 text-sm text-ink/80">
                  {active.coverLetter}
                </pre>
              </div>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
