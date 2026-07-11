import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { impact, takeAction, stills } from "@/data/content";
import HeroImage from "@/components/HeroImage";

export const metadata: Metadata = {
  title: "Take Action | Sueños de una Monarca",
};

export default async function TakeAction() {
  const t = await getTranslations("TakeAction");

  const actions = [
    {
      title: t("hostTitle"),
      description: t("hostDescription"),
      linkLabel: t("hostLink"),
      href: "/host-a-screening",
    },
    {
      title: t("mapTitle"),
      description: t("mapDescription"),
      linkLabel: t("mapLink"),
      href: "/milkweed-map",
    },
    {
      title: t("donateTitle"),
      description: t("donateDescription", { org: takeAction.donateOrg }),
      linkLabel: t("donateLink", { org: takeAction.donateOrg }),
      href: takeAction.donateUrl,
    },
    {
      title: t("plantTitle"),
      description: t("plantDescription"),
      linkLabel: t("plantLink"),
      href: "https://xerces.org/milkweed",
    },
    {
      title: t("spreadTitle"),
      description: t("spreadDescription"),
      linkLabel: t("spreadLink"),
      href: "/contact",
    },
  ];

  return (
    <div>
      <section className="relative h-64 sm:h-80 flex items-center justify-center text-center px-6">
        <HeroImage src={stills[6]} objectPosition="center top" />
        <h1 className="relative font-display text-3xl sm:text-4xl text-cream">
          {t("title")}
        </h1>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-center text-monarch-black/70 max-w-xl mx-auto mb-6">
          {t("introBeforeCount")}{" "}
          <span className="text-milkweed-green font-semibold">
            {impact.milkweedCount}+
          </span>{" "}
          {t("introAfterCount")}
        </p>

        <div className="grid gap-6 sm:grid-cols-2 mt-12">
          {actions.map((action) => (
            <div
              key={action.title}
              className="rounded-xl border border-monarch-black/10 bg-white p-7 flex flex-col"
            >
              <h2 className="font-display text-xl mb-2 text-monarch-orange">
                {action.title}
              </h2>
              <p className="text-monarch-black/75 leading-relaxed mb-5 flex-1">
                {action.description}
              </p>
              {action.href.startsWith("/") ? (
                <Link
                  href={action.href}
                  className="text-milkweed-green-dark font-medium hover:text-milkweed-green"
                >
                  {action.linkLabel} →
                </Link>
              ) : (
                <a
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-milkweed-green-dark font-medium hover:text-milkweed-green"
                >
                  {action.linkLabel} →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
