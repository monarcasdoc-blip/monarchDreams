import { cookies } from "next/headers";
import { ADMIN_LANG_COOKIE, normalizeLang, type AdminLang } from "./dictionary";

// Server-only: reads the language preference cookie the toggle sets. Kept apart
// from dictionary.ts so the client forms can import strings/types from that file
// without pulling in next/headers.
export async function getAdminLang(): Promise<AdminLang> {
  const store = await cookies();
  return normalizeLang(store.get(ADMIN_LANG_COOKIE)?.value);
}
