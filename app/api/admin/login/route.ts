import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminAuthConfigured,
  createSessionToken,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!adminAuthConfigured()) {
    console.error("MILKWEED_ADMIN_PASSWORD / ADMIN_SESSION_SECRET are not set");
    return NextResponse.json(
      { error: "The admin area isn't set up yet." },
      { status: 500 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as { password?: unknown };

  if (typeof body.password !== "string" || !verifyPassword(body.password)) {
    // Blunt the edges of an online guessing attack. Not real rate limiting —
    // that would need shared state across serverless invocations — but this is
    // a single-admin page with a long random password, not a public login.
    await new Promise((resolve) => setTimeout(resolve, 600));
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, createSessionToken(), sessionCookieOptions());
  return response;
}
