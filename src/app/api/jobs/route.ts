import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { computeMatch } from "@/lib/matching";
import type { ResumeContent } from "@/data/demo-resume";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase() || "";
  const remote = searchParams.get("remote");
  const seniority = searchParams.get("seniority");
  const minSalary = Number(searchParams.get("minSalary") || 0);

  const jobs = await prisma.job.findMany({
    orderBy: { postedAt: "desc" },
    take: 100,
  });

  let master: ResumeContent | null = null;
  let preferredLocations: string[] = [];
  let salaryMin: number | null = null;
  if (user) {
    const resume = await prisma.resume.findFirst({
      where: { userId: user.id, isMaster: true },
    });
    if (resume) master = JSON.parse(resume.content) as ResumeContent;
    preferredLocations = JSON.parse(user.profile?.desiredLocations || "[]");
    salaryMin = user.profile?.salaryMin ?? null;
  }

  const filtered = jobs
    .filter((j) => {
      if (q) {
        const hay = `${j.title} ${j.company} ${j.location} ${j.skills}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (remote && j.remoteType !== remote) return false;
      if (seniority && j.seniority !== seniority) return false;
      if (minSalary && (j.salaryMax || 0) < minSalary) return false;
      return true;
    })
    .map((j) => {
      const skills = JSON.parse(j.skills) as string[];
      const match = master
        ? computeMatch({
            resumeSkills: master.skills,
            resumeText: JSON.stringify(master),
            jobSkills: skills,
            jobText: `${j.title} ${j.description} ${skills.join(" ")}`,
            preferredLocations,
            jobLocation: j.location,
            salaryMin,
            jobSalaryMax: j.salaryMax,
          })
        : null;
      return { ...j, skills, requirements: JSON.parse(j.requirements), match };
    })
    .sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0));

  return NextResponse.json({ jobs: filtered });
}
