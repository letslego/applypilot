import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { appUrl } from "@/lib/env";

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(`${appUrl()}/login?error=missing_token`);
  }
  const user = await prisma.user.findFirst({
    where: {
      verifyToken: token,
      verifyTokenExpires: { gt: new Date() },
    },
  });
  if (!user) {
    return NextResponse.redirect(`${appUrl()}/login?error=invalid_token`);
  }
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      verifyToken: null,
      verifyTokenExpires: null,
    },
  });
  await createSession(user.id);
  return NextResponse.redirect(`${appUrl()}/app?verified=1`);
}
