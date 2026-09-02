import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { syncLiveJobs } from "@/lib/jobs/ingest";
import { prisma } from "@/lib/db";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { cronSecret } from "@/lib/env";

/**
 * POST /api/jobs/sync — pull live jobs from public ATS boards + open feeds.
 * Auth required (user) or CRON_SECRET bearer.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const cronOk = Boolean(cronSecret()) && bearer === cronSecret();

  const user = cronOk ? null : await getSessionUser();
  if (!cronOk && !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!cronOk) {
    const rl = rateLimit(clientKey(req, `jobs-sync:${user!.id}`), {
      limit: 4,
      windowMs: 10 * 60_000,
    });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Sync rate limit — try again in a few minutes" },
        { status: 429 },
      );
    }
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
      applyUrl: true,
    },
  });
  const lastSync = await prisma.syncRun.findFirst({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    total,
    bySource: bySource.map((s) => ({
      source: s.source,
      count: s._count._all,
    })),
    latest,
    lastSync,
    note:
      "Live ingest uses public Greenhouse/Ashby career boards plus Remotive, RemoteOK, and Arbeitnow. LinkedIn/Indeed/Glassdoor are not scraped (ToS).",
  });
}
