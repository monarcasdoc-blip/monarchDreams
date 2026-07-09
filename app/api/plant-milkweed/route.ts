import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { geocodeAddress, jitterCoordinates } from "@/lib/geocode";

type Payload = {
  displayName?: string;
  email: string;
  address: string;
  plantName?: string;
  photoUrl: string;
};

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

  return NextResponse.json({ ok: true });
}
