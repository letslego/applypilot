/** Central env accessors — fail closed in production where required. */

export function appUrl() {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret === "applypilot-dev-secret") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET must be set to a strong value in production");
    }
    return "applypilot-dev-secret";
  }
  return secret;
}

export function requireOpenAI() {
  return process.env.REQUIRE_OPENAI === "true";
}

export function hasOpenAI() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function hasStripe() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function hasEmail() {
  return Boolean(process.env.RESEND_API_KEY);
}

export function allowDemoLogin() {
  if (process.env.NODE_ENV === "production") return false;
  return process.env.ALLOW_DEMO_LOGIN !== "false";
}

export function cronSecret() {
  return process.env.CRON_SECRET || "";
}
