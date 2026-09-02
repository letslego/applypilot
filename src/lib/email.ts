import { appUrl, hasEmail } from "./env";

type SendOpts = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(opts: SendOpts): Promise<{ ok: boolean; skipped?: boolean }> {
  if (!hasEmail()) {
    console.info("[email:skipped]", opts.to, opts.subject);
    return { ok: true, skipped: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "ApplyPilot <onboarding@resend.dev>",
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[email:fail]", res.status, body);
    return { ok: false };
  }
  return { ok: true };
}

export async function sendWelcomeEmail(to: string, name: string) {
  return sendEmail({
    to,
    subject: "Welcome to ApplyPilot",
    html: `<p>Hi ${name},</p><p>Your ApplyPilot account is ready. <a href="${appUrl()}/app">Open the dashboard</a> to tailor your resume, sync jobs, and run Auto-Apply.</p><p>— ApplyPilot</p>`,
    text: `Hi ${name}, your ApplyPilot account is ready: ${appUrl()}/app`,
  });
}

export async function sendVerifyEmail(to: string, token: string) {
  const link = `${appUrl()}/api/auth/verify?token=${encodeURIComponent(token)}`;
  return sendEmail({
    to,
    subject: "Verify your ApplyPilot email",
    html: `<p>Confirm your email: <a href="${link}">${link}</a></p><p>This link expires in 24 hours.</p>`,
    text: `Confirm your email: ${link}`,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const link = `${appUrl()}/login?reset=${encodeURIComponent(token)}`;
  return sendEmail({
    to,
    subject: "Reset your ApplyPilot password",
    html: `<p>Reset your password: <a href="${link}">${link}</a></p><p>This link expires in 1 hour. If you didn’t request this, ignore the email.</p>`,
    text: `Reset your password: ${link}`,
  });
}

export async function sendJobAlertEmail(
  to: string,
  name: string,
  jobs: { title: string; company: string; matchScore?: number; url?: string | null }[],
) {
  const items = jobs
    .map(
      (j) =>
        `<li><strong>${j.title}</strong> at ${j.company}${
          j.matchScore != null ? ` — ${j.matchScore}% match` : ""
        }${j.url ? ` — <a href="${j.url}">View</a>` : ""}</li>`,
    )
    .join("");
  return sendEmail({
    to,
    subject: `${jobs.length} new ApplyPilot job matches`,
    html: `<p>Hi ${name},</p><p>New roles matched your saved search:</p><ul>${items}</ul><p><a href="${appUrl()}/app/jobs">Browse jobs</a></p>`,
    text: `New matches: ${jobs.map((j) => `${j.title} @ ${j.company}`).join("; ")}`,
  });
}

export async function sendFollowUpReminder(
  to: string,
  name: string,
  apps: { title: string; company: string }[],
) {
  const items = apps
    .map((a) => `<li>${a.title} at ${a.company}</li>`)
    .join("");
  return sendEmail({
    to,
    subject: "Follow-up reminders from ApplyPilot",
    html: `<p>Hi ${name},</p><p>These applications are due for a follow-up:</p><ul>${items}</ul><p><a href="${appUrl()}/app/tracker">Open tracker</a> · <a href="${appUrl()}/app/outreach">Outreach templates</a></p>`,
    text: `Follow up on: ${apps.map((a) => `${a.title} @ ${a.company}`).join("; ")}`,
  });
}
