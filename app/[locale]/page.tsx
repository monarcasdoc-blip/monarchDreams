import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import HeroVideo from "@/components/HeroVideo";
import { film, impact } from "@/data/content";

export default async function Home() {
  const t = await getTranslations("Home");

  return (
    <div>
      <section className="relative h-[80vh] min-h-[480px] w-full">
        <HeroVideo src="/videos/hero-home.mp4" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="text-cream/80 uppercase tracking-[0.3em] text-xs sm:text-sm mb-4">
            {t("kicker")}
          </p>
          <h1 className="font-display text-4xl sm:text-6xl text-cream leading-tight max-w-3xl">
            {film.title}
          </h1>
          <p className="text-cream/80 text-lg sm:text-xl mt-2 italic">
            {t("subtitle")}
          </p>
          <p className="text-cream mt-6 max-w-xl text-base sm:text-lg">
            {t("tagline")}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="/about"
              className="bg-monarch-orange hover:bg-monarch-orange-dark transition-colors text-cream px-7 py-3 rounded-full font-medium"
            >
              {t("ctaAbout")}
            </Link>
            <Link
              href="/screenings"
              className="bg-cream/10 border border-cream/60 hover:bg-cream/20 transition-colors text-cream px-7 py-3 rounded-full font-medium"
            >
              {t("ctaScreening")}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h2 className="font-display text-2xl sm:text-3xl mb-5">{t("storyHeading")}</h2>
        <p className="text-lg leading-relaxed text-monarch-black/80">
          {t("logline")}
        </p>
        <Link
          href="/about"
          className="inline-block mt-6 text-monarch-orange font-medium hover:text-monarch-orange-dark"
        >
          {t("readMore")}
        </Link>
      </section>

      <section className="bg-milkweed-green text-cream">
        <div className="mx-auto max-w-5xl px-6 py-16 grid gap-10 sm:grid-cols-2 items-center">
          <div>
            <p className="font-display text-5xl sm:text-6xl">
              {impact.milkweedCount}+
            </p>
            <p className="mt-2 text-lg">{t("impactText")}</p>
          </div>
          <div className="sm:text-right">
            <p className="mb-4 text-cream/90">{t("impactSubtext")}</p>
            <Link
              href="/take-action"
              className="inline-block bg-cream text-milkweed-green-dark px-7 py-3 rounded-full font-medium hover:bg-cream/90 transition-colors"
            >
              {t("impactCta")}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="font-display text-2xl sm:text-3xl mb-3">{t("screeningsHeading")}</h2>
        <p className="text-monarch-black/70 mb-6">{t("screeningsText")}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/screenings"
            className="text-monarch-orange font-medium hover:text-monarch-orange-dark"
          >
            {t("viewScreenings")}
          </Link>
          <Link
            href="/host-a-screening"
            className="text-monarch-orange font-medium hover:text-monarch-orange-dark"
          >
            {t("hostScreeningLink")}
          </Link>
        </div>
      </section>
    </div>
  );
}
