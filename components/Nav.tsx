"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import LanguageSwitch from "@/components/LanguageSwitch";

export default function Nav() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: t("home") },
    { href: "/about", label: t("about") },
    { href: "/screenings", label: t("screenings") },
    { href: "/take-action", label: t("takeAction") },
    { href: "/milkweed-map", label: t("milkweedMap") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-monarch-black/10">
      <div className="px-6 lg:px-10 flex items-center justify-between h-18 py-3">
        <Link
          href="/"
          className="font-display text-xl lg:text-xl xl:text-2xl text-monarch-black leading-tight shrink-0"
          onClick={() => setOpen(false)}
        >
          {t("brand")}
        </Link>

        <div className="hidden lg:flex items-center gap-3 xl:gap-5">
          <nav className="flex items-center gap-3 xl:gap-5 text-sm font-medium">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`whitespace-nowrap transition-colors hover:text-monarch-orange ${
                    active ? "text-monarch-orange" : "text-monarch-black"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <LanguageSwitch />
        </div>

        <button
          type="button"
          className="lg:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`block h-0.5 w-6 bg-monarch-black transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-6 bg-monarch-black transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-monarch-black transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-monarch-black/10 bg-cream px-6 py-4 flex flex-col gap-4 text-base font-medium">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={active ? "text-monarch-orange" : "text-monarch-black"}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-monarch-black/10">
            <LanguageSwitch />
          </div>
        </nav>
      )}
    </header>
  );
}
