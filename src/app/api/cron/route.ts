import { NextRequest, NextResponse } from "next/server";
import { cronSecret } from "@/lib/env";
import { syncLiveJobs } from "@/lib/jobs/ingest";
import { processQueuedApplications } from "@/lib/auto-apply/queue";
import { runFollowUpReminders, runJobAlerts } from "@/lib/alerts";

function authorized(req: NextRequest) {
  const secret = cronSecret();
  if (!secret) return process.env.NODE_ENV !== "production";
  const header = req.headers.get("authorization") || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const urlSecret = new URL(req.url).searchParams.get("secret");
  return bearer === secret || urlSecret === secret;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const job = (body.job as string) || new URL(req.url).searchParams.get("job") || "all";

  const out: Record<string, unknown> = { job };

  if (job === "sync-jobs" || job === "all") {
    out.sync = await syncLiveJobs({
      perBoard: Number(body.perBoard || 12),
    });
  }
  if (job === "process-queue" || job === "all") {
    out.queue = await processQueuedApplications(Number(body.limit || 40));
  }
  if (job === "job-alerts" || job === "all") {
    out.alerts = await runJobAlerts();
  }
  if (job === "follow-ups" || job === "all") {
    out.followUps = await runFollowUpReminders();
  }

  return NextResponse.json({ ok: true, ...out });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
