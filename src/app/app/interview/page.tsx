"use client";

import { useState } from "react";
import { Button, Card, Input, Label, PageHeader, Textarea } from "@/components/ui";

type Msg = { role: string; content: string };

export default function MockInterviewPage() {
  const [jobTitle, setJobTitle] = useState("Senior Software Engineer");
  const [company, setCompany] = useState("Stripe");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function turn(message?: string) {
    setLoading(true);
    const res = await fetch("/api/tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "interview-turn",
        kind: "mock",
        jobTitle,
        company,
        sessionId,
        message,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return;
    setSessionId(data.session.id);
    setMessages(JSON.parse(data.session.transcript));
    setInput("");
  }

  return (
    <div>
      <PageHeader
        title="Mock Interview"
        subtitle="Practice role-specific questions and get instant feedback before the real call."
      />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit space-y-3">
          <div>
            <Label>Target role</Label>
            <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
          </div>
          <div>
            <Label>Company</Label>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <Button
            className="w-full"
            disabled={loading}
            onClick={() => {
              setSessionId(null);
              setMessages([]);
              turn();
            }}
          >
            Start session
          </Button>
        </Card>

        <Card className="flex min-h-[480px] flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-sm text-ink/55">
                Start a session to begin the interview simulation.
              </p>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    m.role === "user"
                      ? "ml-auto bg-teal-800 text-sand-50"
                      : "bg-sand-100 text-ink"
                  }`}
                >
                  <div className="mb-1 text-[10px] uppercase tracking-wider opacity-60">
                    {m.role === "user" ? "You" : "Interviewer"}
                  </div>
                  {m.content}
                </div>
              ))
            )}
          </div>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!input.trim() || !sessionId) return;
              turn(input.trim());
            }}
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your answer…"
              rows={2}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !sessionId}>
              Send
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
