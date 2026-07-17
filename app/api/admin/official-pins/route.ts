import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { geocodeAddress } from "@/lib/geocode";

type Payload = {
  siteName: string;
  address: string;
  description?: string;
  photoUrl?: string;
  milkweedCount?: string | number;
  eventName?: string;
  eventDate?: string;
};

// The form sends "" for untouched optional fields. Treat blank as "not given"
// rather than as a zero/invalid number, but still reject a real value that
// isn't a positive whole number — the DB has a matching check constraint.
function parseMilkweedCount(
  raw: unknown
): { ok: true; value: number | null } | { ok: false } {
  if (raw === undefined || raw === null || raw === "") return { ok: true, value: null };

  const count = typeof raw === "number" ? raw : Number(String(raw).trim());
  if (!Number.isInteger(count) || count <= 0) return { ok: false };

  return { ok: true, value: count };
}

export async function POST(request: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Partial<Payload>;

  const siteName = typeof body.siteName === "string" ? body.siteName.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : "";

  if (!siteName || !address) {
    return NextResponse.json(
      { error: "Site name and address are both required." },
      { status: 400 }
    );
  }

  const milkweedCount = parseMilkweedCount(body.milkweedCount);
  if (!milkweedCount.ok) {
    return NextResponse.json(
      { error: "Number of milkweed must be a whole number greater than zero." },
      { status: 400 }
    );
  }

  const eventName = typeof body.eventName === "string" ? body.eventName.trim() : "";
  const eventDate = typeof body.eventDate === "string" ? body.eventDate.trim() : "";

  // A date with no event to hang it on would show as a dangling "· May 3" in the
  // popup, so require the name if a date is given. The reverse is fine.
  if (eventDate && !eventName) {
    return NextResponse.json(
      { error: "Add the event name too, or clear the event date." },
      { status: 400 }
    );
  }

  if (!supabaseAdmin) {
    console.error("SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL are not set");
    return NextResponse.json(
      { error: "The milkweed map isn't set up yet." },
      { status: 500 }
    );
  }

  const coordinates = await geocodeAddress(address);
  if (!coordinates) {
    return NextResponse.json(
      { error: "We couldn't find that address. Try adding the city and state." },
      { status: 422 }
    );
  }

  // Deliberately NOT jittered, unlike public submissions: these are public
  // community plantings, and the point of the pin is to show where they are.
  const { error } = await supabaseAdmin.from("milkweed_official_pins").insert({
    site_name: siteName,
    address,
    description: body.description?.trim() || null,
    photo_url: body.photoUrl || null,
    milkweed_count: milkweedCount.value,
    event_name: eventName || null,
    event_date: eventDate || null,
    lat: coordinates.lat,
    lng: coordinates.lng,
    published: true,
  });

  if (error) {
    console.error("Supabase insert error", error);
    return NextResponse.json(
      { error: "Failed to save the pin. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, lat: coordinates.lat, lng: coordinates.lng });
}
