import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  createSession,
  hashPassword,
  verifyPassword,
  getSessionUser,
  randomToken,
} from "@/lib/auth";
import { DEMO_RESUME } from "@/data/demo-resume";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { sendPasswordResetEmail, sendVerifyEmail, sendWelcomeEmail } from "@/lib/email";
import { allowDemoLogin } from "@/lib/env";

export async function POST(req: NextRequest) {
  const rl = rateLimit(clientKey(req, "auth"), { limit: 30, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json();
  const { action } = body as { action: string };

  if (action === "signup") {
    const email = String(body.email || "")
      .toLowerCase()
      .trim();
    const password = String(body.password || "");
    const name = String(body.name || "Job Seeker").trim();
    if (!email || password.length < 8) {
      return NextResponse.json(
        { error: "Email and password (8+ chars) required" },
        { status: 400 },
      );
    }
    if (
      process.env.NODE_ENV === "production" &&
      email === "demo@applypilot.com"
    ) {
      return NextResponse.json({ error: "Reserved email" }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }
    const verifyToken = randomToken();
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword(password),
        name,
        plan: "free",
        credits: 5,
        verifyToken,
        verifyTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        profile: {
          create: {
            headline: "Job seeker",
            skills: "[]",
            desiredRoles: "[]",
            desiredLocations: "[]",
          },
        },
        autoPrefs: {
          create: {},
        },
        resumes: {
          create: {
            title: "Master Resume",
            isMaster: true,
            content: JSON.stringify({
              ...DEMO_RESUME,
              fullName: name,
              email,
              summary: "Ambitious professional ready for the next role.",
              experience: [],
              skills: [],
            }),
          },
        },
        creditLedger: {
          create: { delta: 5, reason: "Welcome credits" },
        },
      },
    });
    await createSession(user.id);
    await sendWelcomeEmail(email, name);
    await sendVerifyEmail(email, verifyToken);
    return NextResponse.json({ ok: true, userId: user.id, verifyEmailSent: true });
  }

  if (action === "login") {
    const email = String(body.email || "")
      .toLowerCase()
      .trim();
    const password = String(body.password || "");
    if (
      process.env.NODE_ENV === "production" &&
      email === "demo@applypilot.com" &&
      !allowDemoLogin()
    ) {
      return NextResponse.json({ error: "Demo login disabled" }, { status: 403 });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    await createSession(user.id);
    return NextResponse.json({
      ok: true,
      emailVerified: Boolean(user.emailVerified),
    });
  }

  if (action === "request-reset") {
    const email = String(body.email || "")
      .toLowerCase()
      .trim();
    const user = await prisma.user.findUnique({ where: { email } });
    // Always OK to avoid account enumeration
    if (user) {
      const token = randomToken();
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: token,
          resetTokenExpires: new Date(Date.now() + 60 * 60 * 1000),
        },
      });
      await sendPasswordResetEmail(email, token);
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "reset-password") {
    const token = String(body.token || "");
    const password = String(body.password || "");
    if (!token || password.length < 8) {
      return NextResponse.json({ error: "Invalid reset request" }, { status: 400 });
    }
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() },
      },
    });
    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashPassword(password),
        resetToken: null,
        resetTokenExpires: null,
      },
    });
    await createSession(user.id);
    return NextResponse.json({ ok: true });
  }

  if (action === "resend-verify") {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.emailVerified) return NextResponse.json({ ok: true, already: true });
    const token = randomToken();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verifyToken: token,
        verifyTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    await sendVerifyEmail(user.email, token);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      credits: user.credits,
      role: user.role,
      emailVerified: user.emailVerified,
      stripeCustomerId: user.stripeCustomerId,
      profile: user.profile,
    },
    billingConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
  });
}
