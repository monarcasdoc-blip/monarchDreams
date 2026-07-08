import { NextResponse } from "next/server";
import { Resend } from "resend";
import { hostAScreeningEmail } from "@/data/content";

type Payload = {
  firstName: string;
  lastName: string;
  email: string;
  hostingAs: string;
  audienceSize: string;
  hostedBefore: string;
  heardFrom: string;
  comments: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<Payload>;

  const required: (keyof Payload)[] = [
    "firstName",
    "lastName",
    "email",
    "hostingAs",
    "audienceSize",
    "hostedBefore",
  ];
  const missing = required.filter((field) => !body[field]);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required field(s): ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not configured");
    return NextResponse.json(
      { error: "Email service is not configured." },
      { status: 500 }
    );
  }

  const resend = new Resend(apiKey);
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

  const { error } = await resend.emails.send({
    from: `Sueños de una Monarca <${fromEmail}>`,
    to: hostAScreeningEmail,
    replyTo: body.email,
    subject: `Host a Screening request — ${body.firstName} ${body.lastName}`,
    text: [
      `Name: ${body.firstName} ${body.lastName}`,
      `Email: ${body.email}`,
      `Hosting as: ${body.hostingAs}`,
      `Estimated audience size: ${body.audienceSize}`,
      `Hosted before: ${body.hostedBefore}`,
      `Heard about the film from: ${body.heardFrom || "—"}`,
      `Comments: ${body.comments || "—"}`,
    ].join("\n"),
  });

  if (error) {
    console.error("Resend error", error);
    return NextResponse.json(
      { error: "Failed to send request. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
