import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { companyBrief } from "@/lib/ai";
import { computeMatch } from "@/lib/matching";
import type { ResumeContent } from "@/data/demo-resume";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const user = await getSessionUser();
  let match = null;
  if (user) {
    const resume = await prisma.resume.findFirst({
      where: { userId: user.id, isMaster: true },
    });
    if (resume) {
      const master = JSON.parse(resume.content) as ResumeContent;
      const skills = JSON.parse(job.skills) as string[];
      match = computeMatch({
        resumeSkills: master.skills,
        resumeText: JSON.stringify(master),
        jobSkills: skills,
        jobText: `${job.title} ${job.description}`,
        preferredLocations: JSON.parse(user.profile?.desiredLocations || "[]"),
        jobLocation: job.location,
        salaryMin: user.profile?.salaryMin,
        jobSalaryMax: job.salaryMax,
      });
    }
  }

  return NextResponse.json({
    job: {
      ...job,
      skills: JSON.parse(job.skills),
      requirements: JSON.parse(job.requirements),
    },
    match,
    brief: companyBrief(job.company, job.title, job.description),
  });
}
