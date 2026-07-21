import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Payload = {
  id?: string;
  action?: "approve" | "reject";
};

// Moderate a community submission: flip its `status` to approved (shows on the
// map) or rejected (stays hidden, kept for the record). The auth check here is
// independent of the admin page's — gating only the page would leave this
// endpoint open to anyone with the service anon key, same reasoning as
// /api/admin/official-pins.
export async function POST(request: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Partial<Payload>;
  const id = typeof body.id === "string" ? body.id : "";
  const action = body.action;

  if (!id || (action !== "approve" && action !== "reject")) {
    return NextResponse.json(
      { error: "A submission id and a valid action are required." },
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

  const status = action === "approve" ? "approved" : "rejected";

  // Only act on a row that's still pending — makes a double-click (or two admins
  // acting at once) a no-op rather than flipping an already-decided submission.
  const { error } = await supabaseAdmin
    .from("milkweed_submissions")
    .update({ status })
    .eq("id", id)
    .eq("status", "pending");

  if (error) {
    console.error("Supabase update error", error);
    return NextResponse.json(
      { error: "Failed to update the submission. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
