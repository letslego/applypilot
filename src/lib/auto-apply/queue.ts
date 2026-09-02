import { prisma } from "@/lib/db";
import type { ResumeContent } from "@/data/demo-resume";

/**
 * Legal Auto-Apply package: tailored docs + employer apply URL for user-confirmed submit.
 * Does NOT scrape or auto-post to LinkedIn/Indeed.
 */
export async function createApplyPackage(opts: {
  userId: string;
  applicationId: string;
  applyUrl?: string | null;
  resume: ResumeContent;
  coverLetter: string;
}) {
  const answers = await prisma.answerBankEntry.findMany({
    where: { userId: opts.userId },
    take: 50,
  });
  const answersJson = JSON.stringify(
    Object.fromEntries(answers.map((a) => [a.label || a.question, a.answer])),
  );

  return prisma.applyPackage.upsert({
    where: { applicationId: opts.applicationId },
    create: {
      userId: opts.userId,
      applicationId: opts.applicationId,
      applyUrl: opts.applyUrl || null,
      resumeJson: JSON.stringify(opts.resume),
      coverLetter: opts.coverLetter,
      answersJson,
      status: "ready",
    },
    update: {
      applyUrl: opts.applyUrl || null,
      resumeJson: JSON.stringify(opts.resume),
      coverLetter: opts.coverLetter,
      answersJson,
      status: "ready",
    },
  });
}

/** Process queued hybrid applications: ensure packages exist and nudge to applied when URL opened path is confirmed. */
export async function processQueuedApplications(limit = 25) {
  const queued = await prisma.application.findMany({
    where: { status: "queued" },
    include: {
      job: true,
      resume: true,
      applyPackage: true,
      user: { include: { answerBank: true } },
    },
    take: limit,
    orderBy: { createdAt: "asc" },
  });

  let packaged = 0;
  for (const app of queued) {
    if (!app.applyPackage) {
      const resume = app.resume
        ? (JSON.parse(app.resume.content) as ResumeContent)
        : null;
      if (!resume) continue;
      await createApplyPackage({
        userId: app.userId,
        applicationId: app.id,
        applyUrl: app.job.applyUrl || app.job.url,
        resume,
        coverLetter: app.coverLetterText || "",
      });
      packaged += 1;
    }
  }
  return { queued: queued.length, packaged };
}

export async function markPackageSubmitted(packageId: string, userId: string) {
  const pkg = await prisma.applyPackage.findFirst({
    where: { id: packageId, userId },
  });
  if (!pkg) return null;
  await prisma.$transaction([
    prisma.applyPackage.update({
      where: { id: pkg.id },
      data: { status: "submitted", submittedAt: new Date() },
    }),
    prisma.application.update({
      where: { id: pkg.applicationId },
      data: { status: "applied", appliedAt: new Date() },
    }),
  ]);
  return pkg;
}
