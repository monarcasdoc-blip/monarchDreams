import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact | Sueños de una Monarca",
};

// TODO: swap in real social handles once available.
const socials = [{ label: "Instagram", href: "https://instagram.com" }];

export default async function Contact() {
  const t = await getTranslations("Contact");

  return (
    <div className="mx-auto max-w-xl px-6 py-16 text-center">
      <h1 className="font-display text-3xl sm:text-4xl mb-3">{t("title")}</h1>
      <p className="text-monarch-black/70 mb-10">{t("intro")}</p>

      <div className="rounded-xl border border-monarch-black/10 bg-white p-8 mb-8">
        <ContactForm />
      </div>

      <div className="rounded-xl border border-monarch-black/10 bg-white p-8">
        <p className="text-sm uppercase tracking-wide text-milkweed-green mb-4">
          {t("followHeading")}
        </p>
        <div className="flex justify-center gap-6">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-monarch-black font-medium hover:text-monarch-orange"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
