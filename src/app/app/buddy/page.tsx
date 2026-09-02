"use client";

import { useState } from "react";
import { Button, Card, Input, Label, PageHeader, Textarea } from "@/components/ui";

export default function BuddyPage() {
  const [jobTitle, setJobTitle] = useState("Senior Software Engineer");
  const [company, setCompany] = useState("Notion");
  const [question, setQuestion] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hidden, setHidden] = useState(false);

  async function ask() {
    if (!question.trim()) return;
    setLoading(true);
    const res = await fetch("/api/tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "interview-turn",
        kind: "buddy",
        jobTitle,
        company,
        sessionId,
        message: question.trim(),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return;
    setSessionId(data.session.id);
    setSuggestion(data.reply);
  }

  return (
    <div>
      <PageHeader
        title="Interview Buddy"
        subtitle="Real-time answer coaching for live interviews — suggestions stay on your screen only."
        actions={
          <Button variant="secondary" onClick={() => setHidden((h) => !h)}>
            {hidden ? "Show panel" : "Hide (screen share)"}
          </Button>
        }
      />

      {hidden ? (
        <Card className="border-dashed text-center text-ink/50">
          Buddy panel hidden. Click “Show panel” when you’re done sharing.
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="space-y-3">
            <div>
              <Label>Role</Label>
              <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            </div>
            <div>
              <Label>Company</Label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div>
              <Label>Question you just heard</Label>
              <Textarea
                rows={4}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. Tell me about a time you disagreed with a product decision…"
              />
            </div>
            <Button onClick={ask} disabled={loading}>
              {loading ? "Crafting…" : "Suggest answer"}
            </Button>
          </Card>
          <Card>
            <div className="text-xs font-semibold uppercase tracking-wider text-teal-800">
              Suggested response
            </div>
            <div className="mt-4 whitespace-pre-wrap text-ink/85">
              {suggestion ||
                "Your STAR-structured suggestion will appear here — only visible to you."}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
