import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { interviewReply, outreachTemplate } from "@/lib/ai";
import type { ResumeContent } from "@/data/demo-resume";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const kind = new URL(req.url).searchParams.get("resource") || "interviews";

  if (kind === "answers") {
    const answers = await prisma.answerBankEntry.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ answers });
  }
  if (kind === "outreach") {
    const drafts = await prisma.outreachDraft.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ drafts });
  }
  const sessions = await prisma.interviewSession.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json({ sessions });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const action = body.action as string;

  if (action === "interview-turn") {
    const kind = (body.kind as "mock" | "buddy") || "mock";
    const jobTitle = body.jobTitle || "Software Engineer";
    const company = body.company as string | undefined;
    const sessionId = body.sessionId as string | undefined;
    const userMessage = body.message as string | undefined;

    const master = await prisma.resume.findFirst({
      where: { userId: user.id, isMaster: true },
    });
    const resume = master
      ? (JSON.parse(master.content) as ResumeContent)
      : null;

    let session = sessionId
      ? await prisma.interviewSession.findFirst({
          where: { id: sessionId, userId: user.id },
        })
      : null;

    const history = session
      ? (JSON.parse(session.transcript) as {
          role: "user" | "assistant" | "interviewer";
          content: string;
        }[])
      : [];

    if (userMessage) {
      history.push({ role: "user", content: userMessage });
    }

    const { reply, feedback } = await interviewReply({
      kind,
      jobTitle,
      company,
      resumeSummary: resume?.summary || user.name,
      history,
      userMessage,
    });

    history.push({
      role: kind === "buddy" ? "assistant" : "interviewer",
      content: reply,
    });

    if (session) {
      session = await prisma.interviewSession.update({
        where: { id: session.id },
        data: {
          transcript: JSON.stringify(history),
          feedback: feedback || session.feedback,
        },
      });
    } else {
      session = await prisma.interviewSession.create({
        data: {
          userId: user.id,
          jobTitle,
          company,
          kind,
          transcript: JSON.stringify(history),
          feedback,
        },
      });
    }

    return NextResponse.json({ session, reply, feedback });
  }

  if (action === "save-answer") {
    const entry = await prisma.answerBankEntry.create({
      data: {
        userId: user.id,
        label: body.label || "Untitled",
        question: body.question || "",
        answer: body.answer || "",
        category: body.category || "general",
      },
    });
    return NextResponse.json({ entry });
  }

  if (action === "delete-answer") {
    await prisma.answerBankEntry.deleteMany({
      where: { id: body.id, userId: user.id },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "outreach") {
    const channel = (body.channel as "email" | "linkedin") || "email";
    const company = body.company || "Acme";
    const role = body.role || "Software Engineer";
    const tpl = outreachTemplate({
      channel,
      name: user.name,
      company,
      role,
    });
    const draft = await prisma.outreachDraft.create({
      data: {
        userId: user.id,
        channel,
        company,
        role,
        subject: tpl.subject,
        body: tpl.body,
      },
    });
    return NextResponse.json({ draft });
  }

  if (action === "upgrade") {
    return NextResponse.json(
      {
        error: "Use /api/billing/checkout with action checkout-pro",
        redirect: "/api/billing/checkout",
      },
      { status: 400 },
    );
  }

  if (action === "update-profile") {
    await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        headline: body.headline,
        location: body.location,
        summary: body.summary,
        skills: JSON.stringify(body.skills || []),
        desiredRoles: JSON.stringify(body.desiredRoles || []),
        desiredLocations: JSON.stringify(body.desiredLocations || []),
        salaryMin: body.salaryMin ? Number(body.salaryMin) : null,
        salaryMax: body.salaryMax ? Number(body.salaryMax) : null,
        workAuth: body.workAuth,
        phone: body.phone,
        linkedinUrl: body.linkedinUrl,
        yearsExperience: Number(body.yearsExperience || 0),
      },
      update: {
        headline: body.headline,
        location: body.location,
        summary: body.summary,
        skills: JSON.stringify(body.skills || []),
        desiredRoles: JSON.stringify(body.desiredRoles || []),
        desiredLocations: JSON.stringify(body.desiredLocations || []),
        salaryMin: body.salaryMin ? Number(body.salaryMin) : null,
        salaryMax: body.salaryMax ? Number(body.salaryMax) : null,
        workAuth: body.workAuth,
        phone: body.phone,
        linkedinUrl: body.linkedinUrl,
        yearsExperience: Number(body.yearsExperience || 0),
      },
    });
    if (body.name) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name: body.name },
      });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
