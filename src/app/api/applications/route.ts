import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { computeMatch } from "@/lib/matching";
import { generateCoverLetter, tailorResumeLocal } from "@/lib/ai";
import type { ResumeContent } from "@/data/demo-resume";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    include: { job: true, resume: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ applications });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const action = body.action as string;

  if (action === "apply") {
    const jobId = body.jobId as string;
    const mode = (body.mode as string) || "manual";
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    if (mode !== "manual" && user.credits < 1) {
      return NextResponse.json({ error: "Not enough credits" }, { status: 402 });
    }

    const master = await prisma.resume.findFirst({
      where: { userId: user.id, isMaster: true },
    });
    if (!master) {
      return NextResponse.json({ error: "Create a resume first" }, { status: 400 });
    }

    const content = JSON.parse(master.content) as ResumeContent;
    const skills = JSON.parse(job.skills) as string[];
    const match = computeMatch({
      resumeSkills: content.skills,
      resumeText: JSON.stringify(content),
      jobSkills: skills,
      jobText: `${job.title} ${job.description}`,
    });

    const tailored = tailorResumeLocal(
      content,
      job.title,
      job.company,
      skills,
      job.description,
    );
    const tailoredResume = await prisma.resume.create({
      data: {
        userId: user.id,
        title: `${job.title} @ ${job.company}`,
        content: JSON.stringify(tailored),
        tailoredFor: job.id,
      },
    });

    const letter = await generateCoverLetter({
      name: user.name,
      resume: tailored,
      jobTitle: job.title,
      company: job.company,
      jobDescription: job.description,
    });

    const burnCredit = mode !== "manual";
    const app = await prisma.$transaction(async (tx) => {
      if (burnCredit) {
        await tx.user.update({
          where: { id: user.id },
          data: { credits: { decrement: 1 } },
        });
        await tx.creditLedger.create({
          data: {
            userId: user.id,
            delta: -1,
            reason: `Auto-apply: ${job.title} @ ${job.company}`,
          },
        });
      }
      return tx.application.upsert({
        where: { userId_jobId: { userId: user.id, jobId } },
        create: {
          userId: user.id,
          jobId,
          resumeId: tailoredResume.id,
          status: mode === "hybrid" ? "queued" : "applied",
          matchScore: match.score,
          mode,
          coverLetterText: letter,
          appliedAt: mode === "hybrid" ? null : new Date(),
        },
        update: {
          resumeId: tailoredResume.id,
          status: mode === "hybrid" ? "queued" : "applied",
          matchScore: match.score,
          mode,
          coverLetterText: letter,
          appliedAt: mode === "hybrid" ? null : new Date(),
        },
      });
    });

    return NextResponse.json({ application: app, match, letter });
  }

  if (action === "update-status") {
    const id = body.id as string;
    const status = body.status as string;
    const app = await prisma.application.updateMany({
      where: { id, userId: user.id },
      data: { status },
    });
    return NextResponse.json({ ok: app.count > 0 });
  }

  if (action === "save") {
    const jobId = body.jobId as string;
    const app = await prisma.application.upsert({
      where: { userId_jobId: { userId: user.id, jobId } },
      create: {
        userId: user.id,
        jobId,
        status: "saved",
        mode: "manual",
      },
      update: {},
    });
    return NextResponse.json({ application: app });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
