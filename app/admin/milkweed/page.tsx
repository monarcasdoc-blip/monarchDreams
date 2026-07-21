import { adminAuthConfigured, isAdminAuthed } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import AdminLoginForm from "@/components/AdminLoginForm";
import OfficialPinForm from "@/components/OfficialPinForm";
import PendingSubmissions, {
  type PendingSubmission,
} from "@/components/PendingSubmissions";
import { getAdminLang } from "../lang";
import { getAdminDict } from "../dictionary";

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

async function getPendingSubmissions(): Promise<PendingSubmission[]> {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from("milkweed_submissions")
    .select("id, display_name, plant_name, email, address, photo_url, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load pending submissions", error);
    return [];
  }

  return data ?? [];
}

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
  const lang = await getAdminLang();
  const t = getAdminDict(lang);

  if (!adminAuthConfigured()) {
    return (
      <main className="mx-auto max-w-md px-6 py-20">
        <h1 className="font-display text-2xl mb-3">{t.notConfigured.title}</h1>
        <p className="text-monarch-black/70 text-sm leading-relaxed">
          {t.notConfigured.set}{" "}
          <code className="text-monarch-orange">MILKWEED_ADMIN_PASSWORD</code>{" "}
          {t.notConfigured.and}{" "}
          <code className="text-monarch-orange">ADMIN_SESSION_SECRET</code>{" "}
          {t.notConfigured.plus}{" "}
          <code className="text-monarch-orange">SUPABASE_SERVICE_ROLE_KEY</code>
          {t.notConfigured.tail}
        </p>
      </main>
    );
  }

  if (!(await isAdminAuthed())) {
    return <AdminLoginForm t={t.login} />;
  }

  const [pending, pins] = await Promise.all([
    getPendingSubmissions(),
    getOfficialPins(),
  ]);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl mb-10">{t.page.adminTitle}</h1>

      <section className="mb-16">
        <h2 className="font-display text-xl mb-1">
          {t.submissions.heading}
          {pending.length > 0 && ` (${pending.length})`}
        </h2>
        <p className="text-monarch-black/70 text-sm mb-5 leading-relaxed">
          {t.submissions.intro}
        </p>
        <PendingSubmissions submissions={pending} t={t.submissions} />
      </section>

      <h2 className="font-display text-2xl mb-2">{t.page.title}</h2>
      <p className="text-monarch-black/70 mb-8 leading-relaxed">{t.page.intro}</p>

      <OfficialPinForm t={t.form} />

      <section className="mt-14">
        <h2 className="font-display text-xl mb-4">
          {t.page.existing}
          {pins.length > 0 && ` (${pins.length})`}
        </h2>

        {pins.length === 0 ? (
          <p className="text-monarch-black/60 italic text-sm">{t.page.none}</p>
        ) : (
          <ul className="divide-y divide-monarch-black/10 border-t border-monarch-black/10">
            {pins.map((pin) => (
              <li key={pin.id} className="py-3">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-medium">{pin.site_name}</p>
                  {!pin.published && (
                    <span className="text-xs text-monarch-black/50 shrink-0">
                      {t.page.unpublished}
                    </span>
                  )}
                </div>
                {pin.address && (
                  <p className="text-sm text-monarch-black/60">{pin.address}</p>
                )}
                <p className="text-sm text-monarch-black/60">
                  {pin.milkweed_count !== null
                    ? `${pin.milkweed_count} ${t.page.milkweedUnit}`
                    : t.page.countUnrecorded}
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
          {t.page.tableHint1} <code>milkweed_official_pins</code> {t.page.tableHint2}{" "}
          <code>published</code> {t.page.tableHint3}
        </p>
      </section>
    </main>
  );
}
