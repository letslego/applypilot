import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./db";

const SESSION_COOKIE = "ap_session";
const SECRET = process.env.AUTH_SECRET || "applypilot-dev-secret";

function encodeSession(userId: string) {
  const payload = Buffer.from(
    JSON.stringify({ userId, t: Date.now(), s: SECRET.slice(0, 8) }),
  ).toString("base64url");
  return payload;
}

function decodeSession(token: string): string | null {
  try {
    const raw = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
    if (!raw?.userId) return null;
    return raw.userId as string;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, encodeSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSessionUser() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const userId = decodeSession(token);
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true, autoPrefs: true },
  });
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}
