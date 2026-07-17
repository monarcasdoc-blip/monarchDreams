import { redirect } from "next/navigation";

// /admin has no page of its own — the only admin tool is the milkweed pin
// manager. Redirect the bare path there so typing /admin doesn't 404.
// Uses next/navigation (not @/i18n/navigation): admin lives outside app/[locale]
// and is never localized.
export default function AdminIndex() {
  redirect("/admin/milkweed");
}
