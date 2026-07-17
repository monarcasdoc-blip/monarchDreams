import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "milkweed_admin";

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

// Both must be set for the admin area to work at all. Kept separate so that
// rotating the password doesn't invalidate the signing secret and vice versa.
function adminPassword() {
  return process.env.MILKWEED_ADMIN_PASSWORD;
}

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET;
}

export function adminAuthConfigured(): boolean {
  return Boolean(adminPassword() && sessionSecret());
}

// Length-independent constant-time compare. timingSafeEqual throws when the two
// buffers differ in length, which would itself leak length via the exception, so
// compare fixed-size digests of the inputs rather than the raw bytes.
function safeEqual(a: string, b: string): boolean {
  const secret = sessionSecret();
  if (!secret) return false;
  const ha = createHmac("sha256", secret).update(a).digest();
  const hb = createHmac("sha256", secret).update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function verifyPassword(input: string): boolean {
  const expected = adminPassword();
  if (!expected) return false;
  return safeEqual(input, expected);
}

// Token is `<expiry-ms>.<hmac>`. There's no server-side session store — the
// signature is the whole guarantee, so a token can't be revoked before it
// expires except by rotating ADMIN_SESSION_SECRET (which logs everyone out).
// Fine for a single-admin tool; revisit if this ever grows real accounts.
export function createSessionToken(): string {
  const secret = sessionSecret();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");

  const expiresAt = String(Date.now() + SESSION_TTL_SECONDS * 1000);
  const signature = createHmac("sha256", secret).update(expiresAt).digest("hex");
  return `${expiresAt}.${signature}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  const secret = sessionSecret();
  if (!token || !secret) return false;

  const separator = token.lastIndexOf(".");
  if (separator === -1) return false;

  const expiresAt = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  const expected = createHmac("sha256", secret).update(expiresAt).digest("hex");
  if (!safeEqual(signature, expected)) return false;

  const expiry = Number(expiresAt);
  return Number.isFinite(expiry) && Date.now() < expiry;
}

export async function isAdminAuthed(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}
