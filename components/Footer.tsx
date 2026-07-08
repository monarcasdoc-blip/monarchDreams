import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { hostAScreeningEmail, film } from "@/data/content";

export default async function Footer() {
  const t = await getTranslations("Footer");
  const tNav = await getTranslations("Nav");

  return (
    <footer className="bg-monarch-black text-cream">
      <div className="mx-auto max-w-6xl px-6 py-12 grid gap-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg mb-2">{film.title}</p>
          <p className="text-sm text-cream/70">{t("tagline")}</p>
        </div>

        <div className="text-sm">
          <p className="uppercase tracking-wide text-milkweed-green mb-3">
            {t("explore")}
          </p>
          <ul className="space-y-2">
            <li>
              <Link href="/about" className="hover:text-monarch-orange">
                {tNav("about")}
              </Link>
            </li>
            <li>
              <Link href="/screenings" className="hover:text-monarch-orange">
                {tNav("screenings")}
              </Link>
            </li>
            <li>
              <Link href="/take-action" className="hover:text-monarch-orange">
                {tNav("takeAction")}
              </Link>
            </li>
            <li>
              <Link href="/milkweed-map" className="hover:text-monarch-orange">
                {tNav("milkweedMap")}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-monarch-orange">
                {tNav("contact")}
              </Link>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="uppercase tracking-wide text-milkweed-green mb-3">
            {t("follow")}
          </p>
          <ul className="space-y-2">
            <li>
              <a
                href={`mailto:${hostAScreeningEmail}`}
                className="hover:text-monarch-orange"
              >
                {hostAScreeningEmail}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <p className="mx-auto max-w-6xl px-6 py-4 text-xs text-cream/50">
          © {new Date().getFullYear()} {film.title}. {t("rights")}
        </p>
      </div>
    </footer>
  );
}
