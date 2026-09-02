import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  createSession,
  hashPassword,
  verifyPassword,
  destroySession,
  getSessionUser,
} from "@/lib/auth";
import { DEMO_RESUME } from "@/data/demo-resume";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body as { action: string };

  if (action === "signup") {
    const email = String(body.email || "")
      .toLowerCase()
      .trim();
    const password = String(body.password || "");
    const name = String(body.name || "Job Seeker").trim();
    if (!email || password.length < 6) {
      return NextResponse.json(
        { error: "Email and password (6+ chars) required" },
        { status: 400 },
      );
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword(password),
        name,
        plan: "free",
        credits: 5,
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
    return NextResponse.json({ ok: true, userId: user.id });
  }

  if (action === "login") {
    const email = String(body.email || "")
      .toLowerCase()
      .trim();
    const password = String(body.password || "");
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    await createSession(user.id);
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
      profile: user.profile,
    },
  });
}
