"use client";

import { useEffect, useState } from "react";
import { Button, Card, Input, Label, PageHeader, Textarea } from "@/components/ui";

type Draft = {
  id: string;
  channel: string;
  company: string | null;
  role: string | null;
  subject: string | null;
  body: string;
};

export default function OutreachPage() {
  const [channel, setChannel] = useState<"email" | "linkedin">("email");
  const [company, setCompany] = useState("Figma");
  const [role, setRole] = useState("Product Engineer");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [current, setCurrent] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/tools?resource=outreach");
    const data = await res.json();
    if (res.ok) setDrafts(data.drafts || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function generate() {
    setLoading(true);
    const res = await fetch("/api/tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "outreach", channel, company, role }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return;
    setCurrent(data.draft);
    load();
  }

  return (
    <div>
      <PageHeader
        title="Outreach"
        subtitle="Cold email and LinkedIn DM templates tailored to each role — inspired by high-touch job search workflows."
      />
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <Card className="h-fit space-y-3">
          <div>
            <Label>Channel</Label>
            <div className="flex gap-2">
              {(["email", "linkedin"] as const).map((c) => (
                <Button
                  key={c}
                  type="button"
                  variant={channel === c ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setChannel(c)}
                >
                  {c}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label>Company</Label>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div>
            <Label>Role</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
          <Button className="w-full" onClick={generate} disabled={loading}>
            Generate draft
          </Button>
        </Card>
        <div className="space-y-4">
          <Card>
            {current ? (
              <div className="space-y-3">
                {current.subject ? (
                  <div>
                    <Label>Subject</Label>
                    <Input value={current.subject} readOnly />
                  </div>
                ) : null}
                <div>
                  <Label>Body</Label>
                  <Textarea rows={10} value={current.body} readOnly />
                </div>
                <Button
                  variant="secondary"
                  onClick={() => navigator.clipboard.writeText(
                    [current.subject, current.body].filter(Boolean).join("\n\n"),
                  )}
                >
                  Copy
                </Button>
              </div>
            ) : (
              <p className="text-sm text-ink/55">Generate a draft to get started.</p>
            )}
          </Card>
          <Card>
            <h3 className="font-display text-xl">Saved drafts</h3>
            <ul className="mt-3 space-y-2">
              {drafts.map((d) => (
                <li key={d.id}>
                  <button
                    className="w-full rounded-xl bg-sand-50 px-3 py-2 text-left text-sm hover:bg-white"
                    onClick={() => setCurrent(d)}
                  >
                    {d.channel} · {d.role} @ {d.company}
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
