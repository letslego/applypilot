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
  const [emailVerified, setEmailVerified] = useState<string | null>(null);
  const [billingConfigured, setBillingConfigured] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) return;
        setName(d.user.name || "");
        setPlan(d.user.plan);
        setCredits(d.user.credits);
        setEmailVerified(d.user.emailVerified);
        setBillingConfigured(Boolean(d.billingConfigured));
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

  async function billing(action: "checkout-pro" | "portal") {
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    setBusy(false);
    if (data.url) {
      window.location.href = data.url;
      return;
    }
    if (data.mock) {
      setPlan(data.plan);
      setCredits(data.credits);
      setMessage("Dev mock upgrade applied (configure Stripe for live billing).");
      return;
    }
    setMessage(data.error || "Billing request failed");
  }

  async function resendVerify() {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resend-verify" }),
    });
    const data = await res.json();
    setMessage(data.ok ? "Verification email sent (or logged if email not configured)." : data.error);
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Profile, email verification, and billing."
      />
      {message ? (
        <p className="mb-4 rounded-xl border border-teal-900/10 bg-white/70 px-4 py-3 text-sm text-ink/70">
          {message}
        </p>
      ) : null}
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
        <div className="space-y-4">
          <Card>
            <h3 className="font-display text-2xl text-ink">Plan</h3>
            <p className="mt-2 capitalize text-ink/70">
              {plan} · {credits} credits
            </p>
            <p className="mt-2 text-xs text-ink/50">
              Email: {emailVerified ? "verified" : "not verified"}
            </p>
            {!emailVerified ? (
              <Button className="mt-3 w-full" variant="secondary" onClick={resendVerify}>
                Resend verification
              </Button>
            ) : null}
            {plan !== "pro" ? (
              <Button
                className="mt-4 w-full"
                disabled={busy}
                onClick={() => billing("checkout-pro")}
              >
                {billingConfigured ? "Upgrade to Pro" : "Upgrade to Pro (dev)"}
              </Button>
            ) : (
              <Button
                className="mt-4 w-full"
                variant="secondary"
                disabled={busy || !billingConfigured}
                onClick={() => billing("portal")}
              >
                Manage billing
              </Button>
            )}
          </Card>
          <Card>
            <h3 className="font-display text-xl text-ink">Exports</h3>
            <p className="mt-2 text-sm text-ink/60">Download your master resume.</p>
            <div className="mt-3 flex flex-col gap-2">
              <a className="text-sm text-teal-800 underline" href="/api/resumes/export?format=docx">
                Download DOCX
              </a>
              <a className="text-sm text-teal-800 underline" href="/api/resumes/export?format=pdf">
                Print / Save PDF
              </a>
              <a className="text-sm text-teal-800 underline" href="/api/resumes/export?format=txt">
                Plain text
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
