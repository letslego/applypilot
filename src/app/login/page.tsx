"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MarketingNav } from "@/components/marketing-nav";
import { Button, Input, Label, Card } from "@/components/ui";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "forgot" | "reset">("login");
  const [resetToken, setResetToken] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reset = params.get("reset");
    const err = params.get("error");
    if (reset) {
      setResetToken(reset);
      setMode("reset");
    }
    if (err) setError(err.replace(/_/g, " "));
    if (process.env.NODE_ENV !== "production") {
      setEmail((e) => e || "demo@applypilot.com");
      setPassword((p) => p || "demo1234");
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (mode === "forgot") {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request-reset", email }),
      });
      setLoading(false);
      if (!res.ok) {
        setError("Could not start reset");
        return;
      }
      setMessage("If that email exists, a reset link was sent (or logged in dev).");
      return;
    }

    if (mode === "reset") {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset-password",
          token: resetToken,
          password,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error || "Reset failed");
        return;
      }
      window.location.href = "/app";
      return;
    }

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
        <h1 className="font-display text-4xl text-ink">
          {mode === "forgot"
            ? "Reset password"
            : mode === "reset"
              ? "Choose a new password"
              : "Welcome back"}
        </h1>
        <p className="mt-2 text-ink/60">
          {mode === "login"
            ? "Sign in to continue your job search."
            : "We’ll email a secure link if the account exists."}
        </p>
        <Card className="mt-8">
          <form onSubmit={onSubmit} className="space-y-4">
            {mode !== "reset" ? (
              <div>
                <Label>Email</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                />
              </div>
            ) : null}
            {mode !== "forgot" ? (
              <div>
                <Label>{mode === "reset" ? "New password" : "Password"}</Label>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  minLength={mode === "reset" ? 8 : undefined}
                />
              </div>
            ) : null}
            {error ? <p className="text-sm text-rose-700">{error}</p> : null}
            {message ? <p className="text-sm text-teal-800">{message}</p> : null}
            <Button className="w-full" disabled={loading}>
              {loading
                ? "Please wait…"
                : mode === "forgot"
                  ? "Send reset link"
                  : mode === "reset"
                    ? "Update password"
                    : "Sign in"}
            </Button>
          </form>
          <div className="mt-4 space-y-2 text-sm text-ink/55">
            {mode === "login" ? (
              <button
                type="button"
                className="text-teal-800 underline"
                onClick={() => {
                  setMode("forgot");
                  setError("");
                  setMessage("");
                }}
              >
                Forgot password?
              </button>
            ) : (
              <button
                type="button"
                className="text-teal-800 underline"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setMessage("");
                }}
              >
                Back to sign in
              </button>
            )}
            <p>
              No account?{" "}
              <Link href="/signup" className="text-teal-800 underline">
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
