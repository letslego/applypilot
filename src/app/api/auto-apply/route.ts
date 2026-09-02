import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { computeMatch } from "@/lib/matching";
import { generateCoverLetter, tailorResumeLocal } from "@/lib/ai";
import type { ResumeContent } from "@/data/demo-resume";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const prefs = await prisma.autoApplyPrefs.findUnique({
    where: { userId: user.id },
  });
  const ledger = await prisma.creditLedger.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json({
    prefs,
    credits: user.credits,
    plan: user.plan,
    ledger,
  });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const action = body.action as string;

  if (action === "save-prefs") {
    const prefs = await prisma.autoApplyPrefs.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        enabled: Boolean(body.enabled),
        mode: body.mode || "hybrid",
        roles: JSON.stringify(body.roles || []),
        locations: JSON.stringify(body.locations || []),
        excludeCompanies: JSON.stringify(body.excludeCompanies || []),
        minMatchScore: Number(body.minMatchScore || 70),
        remoteOnly: Boolean(body.remoteOnly),
        salaryMin: body.salaryMin ? Number(body.salaryMin) : null,
        dailyLimit: Number(body.dailyLimit || 25),
      },
      update: {
        enabled: Boolean(body.enabled),
        mode: body.mode || "hybrid",
        roles: JSON.stringify(body.roles || []),
        locations: JSON.stringify(body.locations || []),
        excludeCompanies: JSON.stringify(body.excludeCompanies || []),
        minMatchScore: Number(body.minMatchScore || 70),
        remoteOnly: Boolean(body.remoteOnly),
        salaryMin: body.salaryMin ? Number(body.salaryMin) : null,
        dailyLimit: Number(body.dailyLimit || 25),
      },
    });
    return NextResponse.json({ prefs });
  }

  if (action === "buy-credits") {
    const pack = Number(body.pack || 50);
    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: user.id },
        data: { credits: { increment: pack }, plan: user.plan === "free" ? "pro" : user.plan },
      });
      await tx.creditLedger.create({
        data: {
          userId: user.id,
          delta: pack,
          reason: `Purchased ${pack} credit pack (demo)`,
        },
      });
      return u;
    });
    return NextResponse.json({ credits: updated.credits, plan: updated.plan });
  }

  if (action === "run") {
    const prefs = await prisma.autoApplyPrefs.findUnique({
      where: { userId: user.id },
    });
    if (!prefs) {
      return NextResponse.json({ error: "Set preferences first" }, { status: 400 });
    }
    const limit = Math.min(prefs.dailyLimit, user.credits, Number(body.limit || 10));
    if (limit < 1) {
      return NextResponse.json({ error: "Not enough credits" }, { status: 402 });
    }

    const master = await prisma.resume.findFirst({
      where: { userId: user.id, isMaster: true },
    });
    if (!master) {
      return NextResponse.json({ error: "Need a master resume" }, { status: 400 });
    }
    const content = JSON.parse(master.content) as ResumeContent;
    const roles = JSON.parse(prefs.roles) as string[];
    const locations = JSON.parse(prefs.locations) as string[];
    const exclude = new Set(
      (JSON.parse(prefs.excludeCompanies) as string[]).map((c) => c.toLowerCase()),
    );

    const existing = await prisma.application.findMany({
      where: { userId: user.id },
      select: { jobId: true },
    });
    const appliedIds = new Set(existing.map((e) => e.jobId));

    const jobs = await prisma.job.findMany({ orderBy: { postedAt: "desc" } });
    const candidates = [];
    for (const job of jobs) {
      if (appliedIds.has(job.id)) continue;
      if (exclude.has(job.company.toLowerCase())) continue;
      if (prefs.remoteOnly && job.remoteType !== "remote") continue;
      if (prefs.salaryMin && (job.salaryMax || 0) < prefs.salaryMin) continue;
      if (roles.length) {
        const ok = roles.some((r) =>
          job.title.toLowerCase().includes(r.toLowerCase()),
        );
        if (!ok) continue;
      }
      if (locations.length) {
        const ok = locations.some((l) =>
          job.location.toLowerCase().includes(l.toLowerCase()),
        );
        if (!ok && !job.location.toLowerCase().includes("remote")) continue;
      }
      const skills = JSON.parse(job.skills) as string[];
      const match = computeMatch({
        resumeSkills: content.skills,
        resumeText: JSON.stringify(content),
        jobSkills: skills,
        jobText: `${job.title} ${job.description}`,
        preferredLocations: locations,
        jobLocation: job.location,
        salaryMin: prefs.salaryMin,
        jobSalaryMax: job.salaryMax,
      });
      if (match.score < prefs.minMatchScore) continue;
      candidates.push({ job, match, skills });
    }

    candidates.sort((a, b) => b.match.score - a.match.score);
    const selected = candidates.slice(0, limit);
    const results = [];

    for (const { job, match, skills } of selected) {
      const tailored = tailorResumeLocal(
        content,
        job.title,
        job.company,
        skills,
        job.description,
      );
      const letter = await generateCoverLetter({
        name: user.name,
        resume: tailored,
        jobTitle: job.title,
        company: job.company,
        jobDescription: job.description,
      });
      const tailoredResume = await prisma.resume.create({
        data: {
          userId: user.id,
          title: `${job.title} @ ${job.company}`,
          content: JSON.stringify(tailored),
          tailoredFor: job.id,
        },
      });

      const status = prefs.mode === "hybrid" ? "queued" : "applied";
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: { credits: { decrement: 1 } },
        });
        await tx.creditLedger.create({
          data: {
            userId: user.id,
            delta: -1,
            reason: `Auto-apply run: ${job.company}`,
          },
        });
        await tx.application.create({
          data: {
            userId: user.id,
            jobId: job.id,
            resumeId: tailoredResume.id,
            status,
            matchScore: match.score,
            mode: prefs.mode,
            coverLetterText: letter,
            appliedAt: status === "applied" ? new Date() : null,
          },
        });
      });
      results.push({
        jobId: job.id,
        company: job.company,
        title: job.title,
        matchScore: match.score,
        status,
      });
    }

    const fresh = await prisma.user.findUnique({ where: { id: user.id } });
    return NextResponse.json({
      applied: results,
      credits: fresh?.credits ?? 0,
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
