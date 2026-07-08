"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const labels: Record<string, string> = { en: "EN", es: "ES" };

export default function LanguageSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      {routing.locales.map((loc, i) => (
        <div key={loc} className="flex items-center gap-1">
          {i > 0 && <span className="text-monarch-black/30">|</span>}
          <button
            type="button"
            onClick={() => router.replace(pathname, { locale: loc })}
            aria-current={locale === loc}
            className={
              locale === loc
                ? "text-monarch-orange"
                : "text-monarch-black/60 hover:text-monarch-orange"
            }
          >
            {labels[loc] ?? loc.toUpperCase()}
          </button>
        </div>
      ))}
    </div>
  );
}
