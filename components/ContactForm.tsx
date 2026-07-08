"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";

const inputClass =
  "w-full rounded-lg border border-monarch-black/20 bg-white px-4 py-2.5 text-monarch-black focus:outline-none focus:ring-2 focus:ring-monarch-orange";
const labelClass = "block text-sm font-medium text-monarch-black/80 mb-1.5";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const t = useTranslations("Contact");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || t("genericError"));
      }

      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : t("genericError"));
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl bg-milkweed-green/10 border border-milkweed-green/30 p-8 text-center">
        <p className="font-display text-xl text-milkweed-green-dark mb-2">
          {t("successTitle")}
        </p>
        <p className="text-monarch-black/70">{t("successText")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      <div>
        <label className={labelClass} htmlFor="name">{t("formName")} *</label>
        <input className={inputClass} id="name" name="name" required />
      </div>

      <div>
        <label className={labelClass} htmlFor="email">{t("formEmail")} *</label>
        <input className={inputClass} id="email" name="email" type="email" required />
      </div>

      <div>
        <label className={labelClass} htmlFor="message">{t("formMessage")} *</label>
        <textarea className={inputClass} id="message" name="message" rows={5} required />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full sm:w-auto bg-monarch-orange hover:bg-monarch-orange-dark disabled:opacity-60 transition-colors text-cream px-8 py-3 rounded-full font-medium"
      >
        {status === "submitting" ? t("sending") : t("formSubmit")}
      </button>
    </form>
  );
}
