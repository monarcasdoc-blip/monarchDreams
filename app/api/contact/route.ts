import { NextResponse } from "next/server";
import { Resend } from "resend";
import { hostAScreeningEmail } from "@/data/content";

type Payload = {
  name: string;
  email: string;
  message: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<Payload>;

  const required: (keyof Payload)[] = ["name", "email", "message"];
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
    subject: `Website contact form — ${body.name}`,
    text: [`Name: ${body.name}`, `Email: ${body.email}`, "", body.message].join(
      "\n"
    ),
  });

  if (error) {
    console.error("Resend error", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
