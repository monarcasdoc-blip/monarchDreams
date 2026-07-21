import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase/client";
import { geocodeAddress, jitterCoordinates } from "@/lib/geocode";
import { hostAScreeningEmail } from "@/data/content";

type Payload = {
  displayName?: string;
  email: string;
  address: string;
  plantName?: string;
  photoUrl: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Let the team know a plant is waiting for approval, with a link straight to the
// admin page. Best-effort: the submission is already saved by the time this
// runs, so a mail failure (or unset RESEND_API_KEY) must never fail the request
// — it just gets logged. The admin link points back at whichever host the
// submission came from (both domains serve the same admin page).
async function notifySubmission(request: Request, sub: Payload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping milkweed submission notification");
    return;
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "dreamsofamonarch.com";
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const adminUrl = `${proto}://${host}/admin/milkweed`;

  const name = sub.displayName?.trim() || null;
  const plant = sub.plantName?.trim() || null;
  const label = plant || name || "a new plant";

  const text = [
    "Someone added a plant to the Milkweed Map. It's waiting for your approval.",
    "",
    `Name: ${name ?? "—"}`,
    `Plant name: ${plant ?? "—"}`,
    `Email: ${sub.email}`,
    `Address: ${sub.address}`,
    `Photo: ${sub.photoUrl}`,
    "",
    "Approve or reject it here (you'll need the admin password):",
    adminUrl,
  ].join("\n");

  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.55;color:#1a1a1a;">
      <p>Someone added a plant to the <strong>Milkweed Map</strong>. It's waiting for your approval.</p>
      <table style="border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:2px 12px 2px 0;color:#666;">Name</td><td>${escapeHtml(name ?? "—")}</td></tr>
        <tr><td style="padding:2px 12px 2px 0;color:#666;">Plant name</td><td>${escapeHtml(plant ?? "—")}</td></tr>
        <tr><td style="padding:2px 12px 2px 0;color:#666;">Email</td><td>${escapeHtml(sub.email)}</td></tr>
        <tr><td style="padding:2px 12px 2px 0;color:#666;">Address</td><td>${escapeHtml(sub.address)}</td></tr>
      </table>
      <p style="margin:14px 0;"><img src="${escapeHtml(sub.photoUrl)}" alt="Submitted plant" width="220" style="max-width:100%;height:auto;border-radius:8px;" /></p>
      <p style="margin:18px 0;">
        <a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:#e2690f;color:#fff;padding:11px 22px;border-radius:999px;text-decoration:none;font-weight:600;">Review in the admin page</a>
      </p>
      <p style="color:#888;font-size:13px;">You'll need the admin password to sign in.</p>
    </div>
  `;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: `Sueños de una Monarca <${fromEmail}>`,
    to: hostAScreeningEmail,
    replyTo: sub.email,
    subject: `New milkweed submission — ${label}`,
    text,
    html,
  });

  if (error) {
    console.error("Resend error (milkweed submission notification)", error);
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<Payload>;

  const required: (keyof Payload)[] = ["email", "address", "photoUrl"];
  const missing = required.filter((field) => !body[field]);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required field(s): ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  if (!supabase) {
    console.error("Supabase environment variables are not configured");
    return NextResponse.json(
      { error: "The milkweed map isn't set up yet. Please try again later." },
      { status: 500 }
    );
  }

  const coordinates = await geocodeAddress(body.address!);
  if (!coordinates) {
    return NextResponse.json(
      { error: "We couldn't find that address. Please check it and try again." },
      { status: 422 }
    );
  }

  const jittered = jitterCoordinates(coordinates);

  const { error } = await supabase.from("milkweed_submissions").insert({
    display_name: body.displayName || null,
    email: body.email,
    address: body.address,
    plant_name: body.plantName || null,
    lat: jittered.lat,
    lng: jittered.lng,
    photo_url: body.photoUrl,
    status: "pending",
  });

  if (error) {
    console.error("Supabase insert error", error);
    return NextResponse.json(
      { error: "Failed to save your submission. Please try again." },
      { status: 502 }
    );
  }

  // Best-effort notification — never let a mail failure fail a saved submission.
  await notifySubmission(request, {
    displayName: body.displayName,
    email: body.email!,
    address: body.address!,
    plantName: body.plantName,
    photoUrl: body.photoUrl!,
  }).catch((err) => console.error("Milkweed notify email failed", err));

  return NextResponse.json({ ok: true });
}
