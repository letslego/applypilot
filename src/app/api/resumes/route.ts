import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import {
  generateCoverLetter,
  tailorResumeLocal,
  translateResume,
  scanResume,
} from "@/lib/ai";
import type { ResumeContent } from "@/data/demo-resume";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const resumes = await prisma.resume.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({
    resumes: resumes.map((r) => ({
      ...r,
      content: JSON.parse(r.content) as ResumeContent,
    })),
  });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const action = body.action as string;

  if (action === "save") {
    const content = body.content as ResumeContent;
    const title = body.title || "Untitled Resume";
    const id = body.id as string | undefined;
    if (id) {
      const updated = await prisma.resume.update({
        where: { id },
        data: { title, content: JSON.stringify(content) },
      });
      return NextResponse.json({ resume: updated });
    }
    const created = await prisma.resume.create({
      data: {
        userId: user.id,
        title,
        content: JSON.stringify(content),
        isMaster: false,
      },
    });
    return NextResponse.json({ resume: created });
  }

  if (action === "tailor") {
    const resumeId = body.resumeId as string;
    const jobId = body.jobId as string;
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: user.id },
    });
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!resume || !job) {
      return NextResponse.json({ error: "Missing resume or job" }, { status: 400 });
    }
    const content = JSON.parse(resume.content) as ResumeContent;
    const tailored = tailorResumeLocal(
      content,
      job.title,
      job.company,
      JSON.parse(job.skills),
      job.description,
    );
    const created = await prisma.resume.create({
      data: {
        userId: user.id,
        title: `${job.title} @ ${job.company}`,
        content: JSON.stringify(tailored),
        tailoredFor: job.id,
        isMaster: false,
      },
    });
    return NextResponse.json({
      resume: { ...created, content: tailored },
    });
  }

  if (action === "translate") {
    const resumeId = body.resumeId as string;
    const language = body.language as string;
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: user.id },
    });
    if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const content = translateResume(
      JSON.parse(resume.content) as ResumeContent,
      language,
    );
    const created = await prisma.resume.create({
      data: {
        userId: user.id,
        title: `${resume.title} (${language.toUpperCase()})`,
        content: JSON.stringify(content),
        language,
        isMaster: false,
      },
    });
    return NextResponse.json({ resume: { ...created, content } });
  }

  if (action === "scan") {
    const resumeId = body.resumeId as string;
    const jobId = body.jobId as string | undefined;
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: user.id },
    });
    if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const content = JSON.parse(resume.content) as ResumeContent;
    let jobSkills: string[] | undefined;
    let jobDescription: string | undefined;
    let jobTitle: string | undefined;
    if (jobId) {
      const job = await prisma.job.findUnique({ where: { id: jobId } });
      if (job) {
        jobSkills = JSON.parse(job.skills);
        jobDescription = job.description;
        jobTitle = job.title;
      }
    }
    const result = await scanResume({
      resume: content,
      jobSkills,
      jobDescription,
      jobTitle,
    });
    return NextResponse.json({ result });
  }

  if (action === "cover-letter") {
    const resumeId = body.resumeId as string;
    const jobId = body.jobId as string;
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: user.id },
    });
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!resume || !job) {
      return NextResponse.json({ error: "Missing resume or job" }, { status: 400 });
    }
    const content = JSON.parse(resume.content) as ResumeContent;
    const letter = await generateCoverLetter({
      name: user.name,
      resume: content,
      jobTitle: job.title,
      company: job.company,
      jobDescription: job.description,
    });
    const created = await prisma.coverLetter.create({
      data: {
        userId: user.id,
        resumeId: resume.id,
        jobId: job.id,
        title: `Cover — ${job.title} @ ${job.company}`,
        content: letter,
      },
    });
    return NextResponse.json({ coverLetter: created });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
