import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { crew, stills } from "@/data/content";
import CrewCard from "@/components/CrewCard";
import HeroImage from "@/components/HeroImage";

export const metadata: Metadata = {
  title: "About the Film | Sueños de una Monarca",
};

export default async function About() {
  const t = await getTranslations("About");
  const tCrew = await getTranslations("Crew");

  return (
    <div>
      <section className="mx-auto max-w-3xl px-6 pt-16 pb-10">
        <h1 className="font-display text-3xl sm:text-4xl mb-8 text-center">
          {t("title")}
        </h1>
        <p className="text-lg leading-relaxed text-monarch-black/80 mb-5">
          {t.rich("aboutParagraph1", {
            womenLink: (chunks) => (
              <a
                href="https://www.womenforgreenspaces.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-monarch-orange hover:text-monarch-orange-dark underline"
              >
                {chunks}
              </a>
            ),
          })}
        </p>
        <p className="text-lg leading-relaxed text-monarch-black/80 mb-5">
          {t("aboutParagraph2")}
        </p>
      </section>

      <section className="relative h-96 sm:h-[28rem] flex flex-col items-center justify-center text-center px-6">
        <HeroImage src={stills[3]} objectPosition="center 35%" />
        <h2 className="relative font-display text-4xl sm:text-5xl text-cream">
          {t("storyHeading")}
        </h2>
        <p className="relative mt-6 sm:mt-8 max-w-xl text-cream/90 text-lg sm:text-xl leading-relaxed">
          {t("storySubheading")}
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-lg leading-relaxed text-monarch-black/80 mb-4">
          {t("storyText1")}
        </p>
        <p className="text-lg leading-relaxed text-monarch-black/80 mb-4">
          {t("storyText2")}
        </p>
        <p className="text-lg leading-relaxed text-monarch-black/80 mb-4">
          {t("storyText3")}
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl sm:text-3xl mb-10 text-center">
          {t("crewHeading")}
        </h2>
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {crew.map((member) => (
            <CrewCard
              key={member.slug}
              name={member.name}
              headshot={member.headshot}
              objectPosition={member.headshotPosition}
              role={tCrew(`${member.slug}.role`)}
              bio={tCrew(`${member.slug}.bio`)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
