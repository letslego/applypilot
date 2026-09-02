import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./db";
import { authSecret } from "./env";

const SESSION_COOKIE = "ap_session";
const SESSION_DAYS = 30;

function sign(payload: string) {
  return createHmac("sha256", authSecret()).update(payload).digest("base64url");
}

function encodeSession(userId: string) {
  const body = Buffer.from(
    JSON.stringify({
      userId,
      exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
    }),
  ).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decodeSession(token: string): string | null {
  try {
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;
    const expected = sign(body);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const raw = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      userId?: string;
      exp?: number;
    };
    if (!raw?.userId || !raw.exp || raw.exp < Date.now()) return null;
    return raw.userId;
  } catch {
    return null;
  }
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, encodeSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
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

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("FORBIDDEN");
  return user;
}
