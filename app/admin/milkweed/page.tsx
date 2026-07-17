import { adminAuthConfigured, isAdminAuthed } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import AdminLoginForm from "@/components/AdminLoginForm";
import OfficialPinForm from "@/components/OfficialPinForm";

// Auth state lives in a cookie, so this must never be cached or prerendered.
export const dynamic = "force-dynamic";

type OfficialPin = {
  id: string;
  site_name: string;
  description: string | null;
  address: string | null;
  milkweed_count: number | null;
  event_name: string | null;
  event_date: string | null;
  created_at: string;
  published: boolean;
};

async function getOfficialPins(): Promise<OfficialPin[]> {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from("milkweed_official_pins")
    .select(
      "id, site_name, description, address, milkweed_count, event_name, event_date, created_at, published"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load official pins", error);
    return [];
  }

  return data ?? [];
}

export default async function AdminMilkweedPage() {
  if (!adminAuthConfigured()) {
    return (
      <main className="mx-auto max-w-md px-6 py-20">
        <h1 className="font-display text-2xl mb-3">Admin not configured</h1>
        <p className="text-monarch-black/70 text-sm leading-relaxed">
          Set <code className="text-monarch-orange">MILKWEED_ADMIN_PASSWORD</code> and{" "}
          <code className="text-monarch-orange">ADMIN_SESSION_SECRET</code> (plus{" "}
          <code className="text-monarch-orange">SUPABASE_SERVICE_ROLE_KEY</code>) in your
          environment, then reload.
        </p>
      </main>
    );
  }

  if (!(await isAdminAuthed())) {
    return <AdminLoginForm />;
  }

  const pins = await getOfficialPins();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl mb-2">Official milkweed pins</h1>
      <p className="text-monarch-black/70 mb-10 leading-relaxed">
        Milkweed planted by Claudia or with Women for Green Spaces. These show on the
        public map with the orange pod marker, at their exact location — so only add
        public sites like gardens, schools and parks, never someone&apos;s home.
      </p>

      <OfficialPinForm />

      <section className="mt-14">
        <h2 className="font-display text-xl mb-4">
          Existing pins{pins.length > 0 && ` (${pins.length})`}
        </h2>

        {pins.length === 0 ? (
          <p className="text-monarch-black/60 italic text-sm">
            No official pins yet — add the first one above.
          </p>
        ) : (
          <ul className="divide-y divide-monarch-black/10 border-t border-monarch-black/10">
            {pins.map((pin) => (
              <li key={pin.id} className="py-3">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-medium">{pin.site_name}</p>
                  {!pin.published && (
                    <span className="text-xs text-monarch-black/50 shrink-0">
                      unpublished
                    </span>
                  )}
                </div>
                {pin.address && (
                  <p className="text-sm text-monarch-black/60">{pin.address}</p>
                )}
                <p className="text-sm text-monarch-black/60">
                  {pin.milkweed_count !== null
                    ? `${pin.milkweed_count} milkweed`
                    : "Count not recorded"}
                  {pin.event_name && ` · ${pin.event_name}`}
                  {pin.event_date && ` (${pin.event_date})`}
                </p>
                {pin.description && (
                  <p className="text-sm text-monarch-black/70 mt-1">{pin.description}</p>
                )}
              </li>
            ))}
          </ul>
        )}

        <p className="text-xs text-monarch-black/50 mt-6 leading-relaxed">
          To edit or remove a pin, open <code>milkweed_official_pins</code> in the
          Supabase Table Editor — set <code>published</code> to false to hide one from
          the map without deleting it.
        </p>
      </section>
    </main>
  );
}
