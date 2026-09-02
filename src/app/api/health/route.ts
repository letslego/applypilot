import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hasEmail, hasOpenAI, hasStripe } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    dbOk = false;
  }

  const jobs = dbOk ? await prisma.job.count() : 0;
  const body = {
    ok: dbOk,
    service: "applypilot",
    time: new Date().toISOString(),
    database: dbOk ? "up" : "down",
    jobs,
    integrations: {
      openai: hasOpenAI(),
      stripe: hasStripe(),
      email: hasEmail(),
    },
  };

  return NextResponse.json(body, { status: dbOk ? 200 : 503 });
}
