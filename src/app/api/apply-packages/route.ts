import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { markPackageSubmitted } from "@/lib/auto-apply/queue";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const packages = await prisma.applyPackage.findMany({
    where: { userId: user.id },
    include: {
      application: { include: { job: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ packages });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const action = body.action as string;

  if (action === "mark-opened") {
    await prisma.applyPackage.updateMany({
      where: { id: body.id, userId: user.id },
      data: { status: "opened" },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "mark-submitted") {
    const pkg = await markPackageSubmitted(String(body.id), user.id);
    if (!pkg) return NextResponse.json({ error: "Not found" }, { status: 404 });
    // Schedule follow-up in 5 days
    await prisma.application.update({
      where: { id: pkg.applicationId },
      data: {
        followUpAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
