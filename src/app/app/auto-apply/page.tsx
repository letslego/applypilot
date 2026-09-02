"use client";

import { useCallback, useEffect, useState } from "react";
import { Coins, Play, Save, ShieldAlert } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Input,
  Label,
  PageHeader,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";

type Prefs = {
  enabled: boolean;
  mode: "manual" | "hybrid" | "auto" | string;
  roles: string;
  locations: string;
  excludeCompanies: string;
  minMatchScore: number;
  remoteOnly: boolean;
  salaryMin: string;
  dailyLimit: number;
};

type LedgerEntry = {
  id: string;
  delta: number;
  reason: string;
  createdAt: string;
};

type RunResult = {
  jobId: string;
  company: string;
  title: string;
  matchScore: number;
  status: string;
};

const CREDIT_PACKS = [25, 50, 100, 250];

const defaultPrefs: Prefs = {
  enabled: false,
  mode: "hybrid",
  roles: "",
  locations: "",
  excludeCompanies: "",
  minMatchScore: 70,
  remoteOnly: false,
  salaryMin: "",
  dailyLimit: 25,
};

function csvFromJson(raw: string | null | undefined): string {
  if (!raw) return "";
  try {
    const arr = JSON.parse(raw) as string[];
    return Array.isArray(arr) ? arr.join(", ") : "";
  } catch {
    return "";
  }
}

function parseCsv(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function AutoApplyPage() {
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
  const [credits, setCredits] = useState(0);
  const [plan, setPlan] = useState("free");
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<RunResult[]>([]);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/auto-apply");
    if (!res.ok) {
      setError("Could not load auto-apply settings.");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setCredits(data.credits ?? 0);
    setPlan(data.plan ?? "free");
    setLedger(data.ledger || []);
    if (data.prefs) {
      setPrefs({
        enabled: Boolean(data.prefs.enabled),
        mode: data.prefs.mode || "hybrid",
        roles: csvFromJson(data.prefs.roles),
        locations: csvFromJson(data.prefs.locations),
        excludeCompanies: csvFromJson(data.prefs.excludeCompanies),
        minMatchScore: data.prefs.minMatchScore ?? 70,
        remoteOnly: Boolean(data.prefs.remoteOnly),
        salaryMin: data.prefs.salaryMin != null ? String(data.prefs.salaryMin) : "",
        dailyLimit: data.prefs.dailyLimit ?? 25,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function savePrefs() {
    setBusy("save");
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/auto-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save-prefs",
          enabled: prefs.enabled,
          mode: prefs.mode,
          roles: parseCsv(prefs.roles),
          locations: parseCsv(prefs.locations),
          excludeCompanies: parseCsv(prefs.excludeCompanies),
          minMatchScore: Number(prefs.minMatchScore) || 70,
          remoteOnly: prefs.remoteOnly,
          salaryMin: prefs.salaryMin ? Number(prefs.salaryMin) : null,
          dailyLimit: Number(prefs.dailyLimit) || 25,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to save preferences.");
        return;
      }
      setMessage("Preferences saved.");
      await refresh();
    } finally {
      setBusy(null);
    }
  }

  async function runNow() {
    setBusy("run");
    setError(null);
    setMessage(null);
    setLastRun([]);
    try {
      // Ensure prefs exist before run
      await fetch("/api/auto-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save-prefs",
          enabled: prefs.enabled,
          mode: prefs.mode,
          roles: parseCsv(prefs.roles),
          locations: parseCsv(prefs.locations),
          excludeCompanies: parseCsv(prefs.excludeCompanies),
          minMatchScore: Number(prefs.minMatchScore) || 70,
          remoteOnly: prefs.remoteOnly,
          salaryMin: prefs.salaryMin ? Number(prefs.salaryMin) : null,
          dailyLimit: Number(prefs.dailyLimit) || 25,
        }),
      });

      const res = await fetch("/api/auto-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run", limit: 10 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Auto-apply run failed.");
        return;
      }
      setLastRun(data.applied || []);
      setCredits(data.credits ?? credits);
      setMessage(
        data.applied?.length
          ? `Queued/applied ${data.applied.length} role(s). This is a simulator — no external sites were contacted.`
          : "No matching jobs found for your criteria.",
      );
      await refresh();
    } finally {
      setBusy(null);
    }
  }

  async function buyCredits(pack: number) {
    setBusy(`buy-${pack}`);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/auto-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "buy-credits", pack }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Purchase failed.");
        return;
      }
      setCredits(data.credits ?? credits);
      setPlan(data.plan ?? plan);
      setMessage(
        `Added ${pack} credits. Credits never expire — use them anytime.`,
      );
      await refresh();
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-ink/55">Loading auto-apply…</p>;
  }

  return (
    <div>
      <PageHeader
        title="Auto-Apply"
        subtitle="Set criteria, burn credits, and simulate continuous applications. One credit equals one simulated apply."
        actions={
          <div className="rounded-xl bg-teal-800 px-4 py-2 text-sand-50">
            <div className="text-xs uppercase tracking-wide opacity-80">
              Remaining
            </div>
            <div className="font-display text-2xl leading-none">{credits}</div>
          </div>
        }
      />

      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          <strong className="font-medium">Ethical note:</strong> Auto-Apply is a
          simulator. ApplyPilot never submits forms to LinkedIn, Indeed, or
          employer ATS systems. Credits power demo queue runs only.
        </p>
      </div>

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

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="font-display text-xl text-ink">Preferences</h2>
          <p className="mt-1 text-sm text-ink/55">
            Comma-separate lists. Mode controls whether runs land in queued or
            applied.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Target roles</Label>
              <Input
                placeholder="Product Engineer, Frontend, Staff"
                value={prefs.roles}
                onChange={(e) => setPrefs({ ...prefs, roles: e.target.value })}
              />
            </div>
            <div>
              <Label>Locations</Label>
              <Input
                placeholder="Remote, SF, NYC"
                value={prefs.locations}
                onChange={(e) =>
                  setPrefs({ ...prefs, locations: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Exclude companies</Label>
              <Input
                placeholder="Acme, MegaCorp"
                value={prefs.excludeCompanies}
                onChange={(e) =>
                  setPrefs({ ...prefs, excludeCompanies: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Min match score</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={prefs.minMatchScore}
                onChange={(e) =>
                  setPrefs({
                    ...prefs,
                    minMatchScore: Number(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <Label>Salary minimum</Label>
              <Input
                type="number"
                min={0}
                placeholder="Optional"
                value={prefs.salaryMin}
                onChange={(e) =>
                  setPrefs({ ...prefs, salaryMin: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Daily limit</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={prefs.dailyLimit}
                onChange={(e) =>
                  setPrefs({
                    ...prefs,
                    dailyLimit: Number(e.target.value) || 1,
                  })
                }
              />
            </div>
            <div>
              <Label>Mode</Label>
              <select
                className="w-full rounded-xl border border-teal-900/10 bg-white/90 px-3 py-2.5 text-sm text-ink outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                value={prefs.mode}
                onChange={(e) => setPrefs({ ...prefs, mode: e.target.value })}
              >
                <option value="manual">Manual review</option>
                <option value="hybrid">Hybrid (queue first)</option>
                <option value="auto">Full auto (mark applied)</option>
              </select>
            </div>
            <div className="flex flex-col justify-end gap-3 sm:col-span-2">
              <label className="flex items-center gap-2 text-sm text-ink/80">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-teal-900/20 text-teal-800 focus:ring-teal-700"
                  checked={prefs.remoteOnly}
                  onChange={(e) =>
                    setPrefs({ ...prefs, remoteOnly: e.target.checked })
                  }
                />
                Remote only
              </label>
              <label className="flex items-center gap-2 text-sm text-ink/80">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-teal-900/20 text-teal-800 focus:ring-teal-700"
                  checked={prefs.enabled}
                  onChange={(e) =>
                    setPrefs({ ...prefs, enabled: e.target.checked })
                  }
                />
                Enabled (continuous simulator flag)
              </label>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={() => void savePrefs()} disabled={busy !== null}>
              <Save className="h-4 w-4" />
              {busy === "save" ? "Saving…" : "Save preferences"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => void runNow()}
              disabled={busy !== null || credits < 1}
            >
              <Play className="h-4 w-4" />
              {busy === "run" ? "Running…" : "Run now"}
            </Button>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-teal-800" />
              <h2 className="font-display text-xl text-ink">Credits</h2>
            </div>
            <p className="mt-2 text-sm text-ink/65">
              You have <strong className="text-ink">{credits}</strong> credits on
              the <span className="capitalize">{plan}</span> plan.{" "}
              <span className="font-medium text-teal-800">
                Credits never expire
              </span>{" "}
              — buy once, apply whenever you are ready.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {CREDIT_PACKS.map((pack) => (
                <Button
                  key={pack}
                  variant="secondary"
                  size="sm"
                  disabled={busy !== null}
                  onClick={() => void buyCredits(pack)}
                >
                  {busy === `buy-${pack}` ? "…" : `+${pack} pack`}
                </Button>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-xl text-ink">Ledger</h2>
            {ledger.length === 0 ? (
              <p className="mt-3 text-sm text-ink/55">No credit activity yet.</p>
            ) : (
              <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto text-sm">
                {ledger.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-start justify-between gap-3 border-b border-teal-900/5 pb-2 last:border-0"
                  >
                    <div>
                      <p className="text-ink/80">{entry.reason}</p>
                      <p className="text-xs text-ink/45">
                        {formatDate(entry.createdAt)}
                      </p>
                    </div>
                    <Badge
                      className={
                        entry.delta >= 0
                          ? "bg-teal-100 text-teal-900"
                          : "bg-stone-200 text-stone-800"
                      }
                    >
                      {entry.delta >= 0 ? `+${entry.delta}` : entry.delta}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {lastRun.length > 0 ? (
        <Card className="mt-6">
          <h2 className="font-display text-xl text-ink">Last run results</h2>
          <ul className="mt-3 divide-y divide-teal-900/5">
            {lastRun.map((r) => (
              <li
                key={r.jobId}
                className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"
              >
                <div>
                  <span className="font-medium text-ink">{r.title}</span>
                  <span className="text-ink/50"> · {r.company}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-teal-100 text-teal-900">
                    {r.matchScore}%
                  </Badge>
                  <Badge className="bg-sand-100 capitalize text-ink/70">
                    {r.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
