"use client";

import { useEffect, useState } from "react";
import { Button, Card, Input, Label, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/utils";

type Prefs = {
  enabled: boolean;
  mode: string;
  roles: string;
  locations: string;
  excludeCompanies: string;
  minMatchScore: number;
  remoteOnly: boolean;
  salaryMin: number | null;
  dailyLimit: number;
};

export default function AutoApplyPage() {
  const [credits, setCredits] = useState(0);
  const [ledger, setLedger] = useState<
    { id: string; delta: number; reason: string; createdAt: string }[]
  >([]);
  const [roles, setRoles] = useState("Software Engineer, Full-Stack");
  const [locations, setLocations] = useState("Remote, San Francisco");
  const [exclude, setExclude] = useState("");
  const [minMatch, setMinMatch] = useState(72);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [salaryMin, setSalaryMin] = useState("140000");
  const [dailyLimit, setDailyLimit] = useState(10);
  const [mode, setMode] = useState("hybrid");
  const [enabled, setEnabled] = useState(false);
  const [results, setResults] = useState<
    { title: string; company: string; matchScore: number; status: string }[]
  >([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/auto-apply");
    const data = await res.json();
    if (!res.ok) return;
    setCredits(data.credits);
    setLedger(data.ledger || []);
    const p = data.prefs as Prefs | null;
    if (p) {
      setEnabled(p.enabled);
      setMode(p.mode);
      setRoles(JSON.parse(p.roles || "[]").join(", "));
      setLocations(JSON.parse(p.locations || "[]").join(", "));
      setExclude(JSON.parse(p.excludeCompanies || "[]").join(", "));
      setMinMatch(p.minMatchScore);
      setRemoteOnly(p.remoteOnly);
      setSalaryMin(p.salaryMin ? String(p.salaryMin) : "");
      setDailyLimit(p.dailyLimit);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function parseList(s: string) {
    return s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }

  async function savePrefs() {
    setMsg("Saving preferences…");
    await fetch("/api/auto-apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save-prefs",
        enabled,
        mode,
        roles: parseList(roles),
        locations: parseList(locations),
        excludeCompanies: parseList(exclude),
        minMatchScore: minMatch,
        remoteOnly,
        salaryMin: salaryMin ? Number(salaryMin) : null,
        dailyLimit,
      }),
    });
    setMsg("Preferences saved");
  }

  async function run() {
    await savePrefs();
    setMsg("Running Auto-Apply…");
    const res = await fetch("/api/auto-apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "run", limit: dailyLimit }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "Run failed");
      return;
    }
    setResults(data.applied || []);
    setCredits(data.credits);
    setMsg(`Queued/applied ${data.applied?.length || 0} roles`);
    load();
  }

  async function buy(pack: number) {
    const res = await fetch("/api/auto-apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "buy-credits", pack }),
    });
    const data = await res.json();
    if (res.ok) {
      setCredits(data.credits);
      setMsg(`Added ${pack} credits (demo purchase)`);
      load();
    }
  }

  return (
    <div>
      <PageHeader
        title="Auto-Apply"
        subtitle="Match, tailor, and submit at scale. 1 credit = 1 application. Credits never expire. This demo simulates submissions ethically — no scraping of third-party boards."
        actions={
          <div className="rounded-xl bg-teal-800 px-4 py-2 text-sm text-sand-50">
            {credits} credits
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Target roles</Label>
              <Input value={roles} onChange={(e) => setRoles(e.target.value)} />
            </div>
            <div>
              <Label>Locations</Label>
              <Input value={locations} onChange={(e) => setLocations(e.target.value)} />
            </div>
            <div>
              <Label>Exclude companies</Label>
              <Input value={exclude} onChange={(e) => setExclude(e.target.value)} />
            </div>
            <div>
              <Label>Min match score</Label>
              <Input
                type="number"
                value={minMatch}
                onChange={(e) => setMinMatch(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Salary floor</Label>
              <Input value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
            </div>
            <div>
              <Label>Daily limit</Label>
              <Input
                type="number"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Label className="mb-0">Mode</Label>
            {["manual", "hybrid", "auto"].map((m) => (
              <Button
                key={m}
                size="sm"
                variant={mode === m ? "primary" : "secondary"}
                onClick={() => setMode(m)}
              >
                {m}
              </Button>
            ))}
            <label className="ml-auto flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
              />
              Remote only
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              Enabled
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={savePrefs}>
              Save prefs
            </Button>
            <Button onClick={run}>Run now</Button>
          </div>
          {msg ? <p className="text-sm text-teal-800">{msg}</p> : null}
          {results.length ? (
            <div className="rounded-xl bg-sand-50 p-3 text-sm">
              {results.map((r, i) => (
                <div key={i} className="flex justify-between gap-2 py-1">
                  <span>
                    {r.title} @ {r.company}
                  </span>
                  <span>
                    {r.matchScore}% · {r.status}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </Card>

        <div className="space-y-6">
          <Card>
            <h3 className="font-display text-xl">Buy credits</h3>
            <p className="mt-1 text-sm text-ink/60">Demo checkout — no payment processed.</p>
            <div className="mt-4 space-y-2">
              {[25, 50, 100].map((n) => (
                <Button
                  key={n}
                  className="w-full"
                  variant="secondary"
                  onClick={() => buy(n)}
                >
                  {n} credits
                </Button>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="font-display text-xl">Credit ledger</h3>
            <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm">
              {ledger.map((l) => (
                <li key={l.id} className="flex justify-between gap-2">
                  <span className="text-ink/70">{l.reason}</span>
                  <span className={l.delta >= 0 ? "text-emerald-700" : "text-rose-700"}>
                    {l.delta > 0 ? "+" : ""}
                    {l.delta}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-ink/40">
              Updated {formatDate(ledger[0]?.createdAt)}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
