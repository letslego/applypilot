"use client";

import { useEffect, useState } from "react";
import { Button, Card, Input, Label, PageHeader, Textarea } from "@/components/ui";

type Entry = {
  id: string;
  label: string;
  question: string;
  answer: string;
  category: string;
};

export default function AnswersPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [label, setLabel] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("general");

  async function load() {
    const res = await fetch("/api/tools?resource=answers");
    const data = await res.json();
    if (res.ok) setEntries(data.answers || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    await fetch("/api/tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save-answer", label, question, answer, category }),
    });
    setLabel("");
    setQuestion("");
    setAnswer("");
    load();
  }

  async function remove(id: string) {
    await fetch("/api/tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete-answer", id }),
    });
    load();
  }

  return (
    <div>
      <PageHeader
        title="Answer Bank"
        subtitle="Store reusable answers for work auth, salary, notice period, and custom EE questions — like Simplify autofill memory."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-3">
          <div>
            <Label>Label</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div>
            <Label>Category</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div>
            <Label>Question</Label>
            <Input value={question} onChange={(e) => setQuestion(e.target.value)} />
          </div>
          <div>
            <Label>Answer</Label>
            <Textarea rows={5} value={answer} onChange={(e) => setAnswer(e.target.value)} />
          </div>
          <Button onClick={save}>Save answer</Button>
        </Card>
        <div className="space-y-3">
          {entries.map((e) => (
            <Card key={e.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-ink">{e.label}</div>
                  <div className="text-xs uppercase tracking-wider text-ink/45">
                    {e.category}
                  </div>
                  <p className="mt-2 text-sm text-ink/70">{e.question}</p>
                  <p className="mt-1 text-sm text-ink">{e.answer}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => remove(e.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
