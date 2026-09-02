import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { JOBS_SEED } from "../src/data/jobs";
import { DEMO_RESUME } from "../src/data/demo-resume";

const prisma = new PrismaClient();

async function main() {
  await prisma.applyPackage.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.syncRun.deleteMany();
  await prisma.application.deleteMany();
  await prisma.coverLetter.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.creditLedger.deleteMany();
  await prisma.interviewSession.deleteMany();
  await prisma.answerBankEntry.deleteMany();
  await prisma.savedSearch.deleteMany();
  await prisma.outreachDraft.deleteMany();
  await prisma.autoApplyPrefs.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();

  for (const job of JOBS_SEED) {
    await prisma.job.create({
      data: {
        ...job,
        applyUrl: job.url || null,
      },
    });
  }

  const passwordHash = await bcrypt.hash("demo1234", 12);
  const user = await prisma.user.create({
    data: {
      email: "demo@applypilot.com",
      passwordHash,
      name: "Alex Rivera",
      plan: "pro",
      credits: 50,
      emailVerified: new Date(),
      role: "admin",
      profile: {
        create: {
          headline: "Senior Full-Stack Engineer",
          location: "San Francisco, CA",
          linkedinUrl: "https://linkedin.com/in/alexrivera",
          phone: "+1 (415) 555-0142",
          summary:
            "Full-stack engineer with 8 years building product-led SaaS. Strong in TypeScript, React, Node, and cloud infrastructure. Led teams shipping hiring and growth products used by millions.",
          skills: JSON.stringify([
            "TypeScript",
            "React",
            "Next.js",
            "Node.js",
            "PostgreSQL",
            "AWS",
            "System Design",
            "Python",
            "GraphQL",
            "Docker",
          ]),
          yearsExperience: 8,
          desiredRoles: JSON.stringify([
            "Senior Software Engineer",
            "Staff Engineer",
            "Full-Stack Engineer",
          ]),
          desiredLocations: JSON.stringify([
            "San Francisco",
            "Remote",
            "New York",
          ]),
          salaryMin: 160000,
          salaryMax: 220000,
          workAuth: "US Citizen",
          willingRemote: true,
        },
      },
      autoPrefs: {
        create: {
          enabled: false,
          mode: "hybrid",
          roles: JSON.stringify([
            "Software Engineer",
            "Full-Stack",
            "Backend",
          ]),
          locations: JSON.stringify(["Remote", "San Francisco", "New York"]),
          excludeCompanies: JSON.stringify([]),
          minMatchScore: 72,
          remoteOnly: false,
          salaryMin: 140000,
          dailyLimit: 25,
        },
      },
    },
  });

  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      title: "Master Resume — Full-Stack",
      isMaster: true,
      content: JSON.stringify(DEMO_RESUME),
    },
  });

  await prisma.creditLedger.create({
    data: {
      userId: user.id,
      delta: 50,
      reason: "Pro welcome credits",
    },
  });

  await prisma.answerBankEntry.createMany({
    data: [
      {
        userId: user.id,
        label: "Work authorization",
        question: "Are you authorized to work in the US?",
        answer: "Yes, I am a US citizen and do not require sponsorship.",
        category: "eligibility",
      },
      {
        userId: user.id,
        label: "Salary expectation",
        question: "What are your salary expectations?",
        answer:
          "I'm targeting $180k–$210k base depending on equity, bonus, and scope.",
        category: "compensation",
      },
      {
        userId: user.id,
        label: "Notice period",
        question: "When can you start?",
        answer: "I can start within 2–3 weeks after an offer.",
        category: "logistics",
      },
    ],
  });

  const jobs = await prisma.job.findMany({ take: 12 });
  const statuses = [
    "applied",
    "applied",
    "interview",
    "applied",
    "saved",
    "queued",
    "rejected",
    "applied",
    "interview",
    "offer",
    "applied",
    "saved",
  ] as const;

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const status = statuses[i];
    await prisma.application.create({
      data: {
        userId: user.id,
        jobId: job.id,
        resumeId: resume.id,
        status,
        matchScore: 68 + ((i * 7) % 28),
        mode: status === "queued" ? "auto" : "manual",
        appliedAt:
          status === "saved" || status === "queued"
            ? null
            : new Date(Date.now() - i * 86400000),
        notes: i === 2 ? "Recruiter asked for availability next week" : null,
        followUpAt:
          status === "applied"
            ? new Date(Date.now() + (5 - i) * 86400000)
            : null,
      },
    });
  }

  console.log(`Seeded ${JOBS_SEED.length} jobs and demo user ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
