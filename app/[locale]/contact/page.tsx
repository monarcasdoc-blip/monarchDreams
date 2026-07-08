import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact | Sueños de una Monarca",
};

export default async function Contact() {
  const t = await getTranslations("Contact");

  return (
    <div className="mx-auto max-w-xl px-6 py-16 text-center">
      <h1 className="font-display text-3xl sm:text-4xl mb-3">{t("title")}</h1>
      <p className="text-monarch-black/70 mb-10">{t("intro")}</p>

      <div className="rounded-xl border border-monarch-black/10 bg-white p-8">
        <ContactForm />
      </div>
    </div>
  );
}
