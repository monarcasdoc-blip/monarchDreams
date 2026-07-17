"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ADMIN_LANG_COOKIE, type AdminLang } from "@/app/admin/dictionary";

const LANGS: { code: AdminLang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
];

export default function AdminLangToggle({
  current,
  ariaLabel,
}: {
  current: AdminLang;
  ariaLabel: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(lang: AdminLang) {
    if (lang === current) return;
    // Non-secret UI preference the server reads back on the next render. One year,
    // site-wide path so every admin route (and its API refresh) sees it.
    document.cookie = `${ADMIN_LANG_COOKIE}=${lang}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    startTransition(() => router.refresh());
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex overflow-hidden rounded-full border border-monarch-black/15 text-xs font-medium"
    >
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => choose(code)}
          disabled={pending}
          aria-pressed={code === current}
          className={
            code === current
              ? "bg-monarch-orange text-cream px-3 py-1"
              : "bg-white text-monarch-black/70 hover:bg-monarch-black/5 px-3 py-1 disabled:opacity-60"
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}
