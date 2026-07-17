import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { upcomingScreenings, pastScreenings } from "@/data/content";
import ScreeningCard from "@/components/ScreeningCard";
import HeroVideo from "@/components/HeroVideo";

export const metadata: Metadata = {
  title: "Screenings | Sueños de una Monarca",
};

export default async function Screenings() {
  const t = await getTranslations("Screenings");

  return (
    <div>
      <section className="relative h-64 sm:h-80 flex items-center justify-center text-center px-6">
        <HeroVideo src="/videos/hero-2.mp4" />
        <h1 className="relative font-display text-3xl sm:text-4xl text-cream">
          {t("title")}
        </h1>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-center text-monarch-black/70 max-w-xl mx-auto mb-12">
          {t("intro")}{" "}
          <Link href="/host-a-screening" className="text-monarch-orange font-medium hover:text-monarch-orange-dark">
            {t("hostLink")}
          </Link>
          .
        </p>

        <section className="mb-16">
          <h2 className="font-display text-xl sm:text-2xl mb-6">{t("upcomingHeading")}</h2>
          {upcomingScreenings.length === 0 ? (
            <p className="text-monarch-black/60 italic">{t("comingSoon")}</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingScreenings.map((s) => (
                <ScreeningCard key={s.festival + s.date} screening={s} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-display text-xl sm:text-2xl mb-6">{t("pastHeading")}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pastScreenings.map((s) => (
              <ScreeningCard key={s.festival + s.date} screening={s} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
