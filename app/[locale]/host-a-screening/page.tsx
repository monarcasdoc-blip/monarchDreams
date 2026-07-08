import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import HostAScreeningForm from "@/components/HostAScreeningForm";

export const metadata: Metadata = {
  title: "Host a Screening | Sueños de una Monarca",
};

export default async function HostAScreening() {
  const t = await getTranslations("HostAScreening");

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl sm:text-4xl mb-3 text-center">
        {t("title")}
      </h1>
      <p className="text-center text-monarch-black/70 mb-10">{t("intro")}</p>
      <HostAScreeningForm />
    </div>
  );
}
