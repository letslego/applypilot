"use client";

import { useEffect, useState } from "react";
import { Button, Card, Input, Label, PageHeader, Textarea } from "@/components/ui";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [desiredRoles, setDesiredRoles] = useState("");
  const [desiredLocations, setDesiredLocations] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [workAuth, setWorkAuth] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [plan, setPlan] = useState("free");
  const [credits, setCredits] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) return;
        setName(d.user.name || "");
        setPlan(d.user.plan);
        setCredits(d.user.credits);
        const p = d.user.profile;
        if (!p) return;
        setHeadline(p.headline || "");
        setLocation(p.location || "");
        setSummary(p.summary || "");
        setSkills(JSON.parse(p.skills || "[]").join(", "));
        setDesiredRoles(JSON.parse(p.desiredRoles || "[]").join(", "));
        setDesiredLocations(JSON.parse(p.desiredLocations || "[]").join(", "));
        setSalaryMin(p.salaryMin ? String(p.salaryMin) : "");
        setSalaryMax(p.salaryMax ? String(p.salaryMax) : "");
        setWorkAuth(p.workAuth || "");
        setPhone(p.phone || "");
        setLinkedinUrl(p.linkedinUrl || "");
      });
  }, []);

  async function save() {
    await fetch("/api/tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update-profile",
        name,
        headline,
        location,
        summary,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        desiredRoles: desiredRoles.split(",").map((s) => s.trim()).filter(Boolean),
        desiredLocations: desiredLocations
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        salaryMin,
        salaryMax,
        workAuth,
        phone,
        linkedinUrl,
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function upgrade() {
    const res = await fetch("/api/tools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "upgrade" }),
    });
    const data = await res.json();
    if (res.ok) {
      setPlan(data.plan);
      setCredits(data.credits);
    }
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Profile, preferences, and billing (demo upgrades — no real charges)."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Headline</Label>
              <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>LinkedIn URL</Label>
              <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Summary</Label>
              <Textarea rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Skills (comma-separated)</Label>
              <Input value={skills} onChange={(e) => setSkills(e.target.value)} />
            </div>
            <div>
              <Label>Desired roles</Label>
              <Input value={desiredRoles} onChange={(e) => setDesiredRoles(e.target.value)} />
            </div>
            <div>
              <Label>Desired locations</Label>
              <Input
                value={desiredLocations}
                onChange={(e) => setDesiredLocations(e.target.value)}
              />
            </div>
            <div>
              <Label>Salary min</Label>
              <Input value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
            </div>
            <div>
              <Label>Salary max</Label>
              <Input value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} />
            </div>
            <div>
              <Label>Work authorization</Label>
              <Input value={workAuth} onChange={(e) => setWorkAuth(e.target.value)} />
            </div>
          </div>
          <Button onClick={save}>{saved ? "Saved" : "Save profile"}</Button>
        </Card>
        <Card>
          <h3 className="font-display text-2xl text-ink">Plan</h3>
          <p className="mt-2 capitalize text-ink/70">
            {plan} · {credits} credits
          </p>
          {plan !== "pro" ? (
            <Button className="mt-4 w-full" onClick={upgrade}>
              Upgrade to Pro (demo)
            </Button>
          ) : (
            <p className="mt-4 text-sm text-ink/55">
              Pro unlocked. Buy more credits from Auto-Apply.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
