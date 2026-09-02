import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { syncLiveJobs } from "@/lib/jobs/ingest";
import { prisma } from "@/lib/db";

/**
 * POST /api/jobs/sync — pull live jobs from public ATS boards + open feeds.
 * Auth required. Rate-limited lightly by requiring a logged-in user.
 */
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const quick = Boolean(body.quick);

  const summary = await syncLiveJobs(
    quick
      ? {
          greenhouse: true,
          ashby: true,
          remotive: true,
          remoteok: true,
          arbeitnow: false,
          perBoard: 8,
          greenhouseTokens: ["stripe", "airbnb", "figma", "vercel", "datadog"],
        }
      : {
          perBoard: Number(body.perBoard || 15),
        },
  );

  const total = await prisma.job.count();
  return NextResponse.json({ ok: true, totalJobs: total, ...summary });
}

export async function GET() {
  const bySource = await prisma.job.groupBy({
    by: ["source"],
    _count: { _all: true },
  });
  const total = await prisma.job.count();
  const latest = await prisma.job.findMany({
    orderBy: { postedAt: "desc" },
    take: 5,
    select: {
      title: true,
      company: true,
      source: true,
      postedAt: true,
      url: true,
    },
  });
  return NextResponse.json({
    total,
    bySource: bySource.map((s) => ({
      source: s.source,
      count: s._count._all,
    })),
    latest,
    note:
      "Live ingest uses public Greenhouse/Ashby career boards plus Remotive, RemoteOK, and Arbeitnow. LinkedIn/Indeed/Glassdoor are not scraped (ToS).",
  });
}
