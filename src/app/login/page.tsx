"use client";

import Link from "next/link";
import { useState } from "react";
import { MarketingNav } from "@/components/marketing-nav";
import { Button, Input, Label, Card } from "@/components/ui";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@applypilot.com");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }
    window.location.href = "/app";
  }

  return (
    <div className="atmosphere min-h-screen">
      <MarketingNav />
      <div className="mx-auto flex max-w-md flex-col px-6 py-16">
        <h1 className="font-display text-4xl text-ink">Welcome back</h1>
        <p className="mt-2 text-ink/60">Sign in to continue your job search.</p>
        <Card className="mt-8">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
              />
            </div>
            {error ? <p className="text-sm text-rose-700">{error}</p> : null}
            <Button className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-ink/55">
            No account?{" "}
            <Link href="/signup" className="text-teal-800 underline">
              Sign up
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
