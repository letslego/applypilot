import { prisma } from "@/lib/db";
import { computeMatch } from "@/lib/matching";
import { sendFollowUpReminder, sendJobAlertEmail } from "@/lib/email";
import type { ResumeContent } from "@/data/demo-resume";

export async function runFollowUpReminders() {
  const due = await prisma.application.findMany({
    where: {
      followUpAt: { lte: new Date() },
      status: { in: ["applied", "queued", "interview"] },
    },
    include: { job: true, user: true },
    take: 100,
  });

  const byUser = new Map<string, typeof due>();
  for (const app of due) {
    const list = byUser.get(app.userId) || [];
    list.push(app);
    byUser.set(app.userId, list);
  }

  let emailed = 0;
  for (const [, apps] of byUser) {
    const user = apps[0].user;
    await sendFollowUpReminder(
      user.email,
      user.name,
      apps.map((a) => ({ title: a.job.title, company: a.job.company })),
    );
    await prisma.notification.create({
      data: {
        userId: user.id,
        kind: "follow_up",
        title: "Follow-up reminders",
        body: `${apps.length} application(s) need a nudge.`,
      },
    });
    // Clear due dates so we don't spam
    await prisma.application.updateMany({
      where: { id: { in: apps.map((a) => a.id) } },
      data: { followUpAt: null },
    });
    emailed += 1;
  }
  return { users: emailed, applications: due.length };
}

export async function runJobAlerts() {
  const prefsUsers = await prisma.autoApplyPrefs.findMany({
    where: { alertsEnabled: true },
    include: {
      user: {
        include: {
          resumes: { where: { isMaster: true }, take: 1 },
          profile: true,
        },
      },
    },
  });

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const freshJobs = await prisma.job.findMany({
    where: { postedAt: { gte: since } },
    orderBy: { postedAt: "desc" },
    take: 200,
  });

  let sent = 0;
  for (const pref of prefsUsers) {
    const user = pref.user;
    const master = user.resumes[0];
    if (!master || !freshJobs.length) continue;
    const content = JSON.parse(master.content) as ResumeContent;
    const roles = JSON.parse(pref.roles) as string[];
    const locations = JSON.parse(pref.locations) as string[];

    const matches = [];
    for (const job of freshJobs) {
      if (roles.length) {
        const ok = roles.some((r) =>
          job.title.toLowerCase().includes(r.toLowerCase()),
        );
        if (!ok) continue;
      }
      if (pref.remoteOnly && job.remoteType !== "remote") continue;
      const skills = JSON.parse(job.skills) as string[];
      const match = computeMatch({
        resumeSkills: content.skills,
        resumeText: JSON.stringify(content),
        jobSkills: skills,
        jobText: `${job.title} ${job.description}`,
        preferredLocations: locations,
        jobLocation: job.location,
        salaryMin: pref.salaryMin,
        jobSalaryMax: job.salaryMax,
      });
      if (match.score >= pref.minMatchScore) {
        matches.push({
          title: job.title,
          company: job.company,
          matchScore: match.score,
          url: job.url,
        });
      }
    }

    const top = matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 8);
    if (!top.length) continue;

    await sendJobAlertEmail(user.email, user.name, top);
    await prisma.notification.create({
      data: {
        userId: user.id,
        kind: "job_alert",
        title: "New job matches",
        body: `${top.length} roles matched your Auto-Apply preferences.`,
      },
    });
    sent += 1;
  }
  return { sent, freshJobs: freshJobs.length };
}
