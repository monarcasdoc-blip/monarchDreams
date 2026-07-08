"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";

const inputClass =
  "w-full rounded-lg border border-monarch-black/20 bg-white px-4 py-2.5 text-monarch-black focus:outline-none focus:ring-2 focus:ring-monarch-orange";
const labelClass = "block text-sm font-medium text-monarch-black/80 mb-1.5";

type Status = "idle" | "submitting" | "success" | "error";

export default function HostAScreeningForm() {
  const t = useTranslations("HostAScreening");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/host-a-screening", {
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="firstName">{t("firstName")} *</label>
          <input className={inputClass} id="firstName" name="firstName" required />
        </div>
        <div>
          <label className={labelClass} htmlFor="lastName">{t("lastName")} *</label>
          <input className={inputClass} id="lastName" name="lastName" required />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="email">{t("email")} *</label>
        <input className={inputClass} id="email" name="email" type="email" required />
      </div>

      <div>
        <label className={labelClass} htmlFor="hostingAs">{t("hostingAs")} *</label>
        <select className={inputClass} id="hostingAs" name="hostingAs" required defaultValue="">
          <option value="" disabled>{t("selectOne")}</option>
          <option value="Individual">{t("optionIndividual")}</option>
          <option value="School / Educator">{t("optionSchool")}</option>
          <option value="Community Organization">{t("optionCommunity")}</option>
          <option value="Faith Group">{t("optionFaith")}</option>
          <option value="Festival / Theater">{t("optionFestival")}</option>
          <option value="Other">{t("optionOther")}</option>
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="audienceSize">{t("audienceSize")} *</label>
        <input className={inputClass} id="audienceSize" name="audienceSize" type="number" min="1" required />
      </div>

      <div>
        <span className={labelClass}>{t("hostedBeforeQuestion")} *</span>
        <div className="flex gap-6 mt-1">
          <label className="flex items-center gap-2 text-monarch-black/80">
            <input type="radio" name="hostedBefore" value="Yes" required /> {t("yes")}
          </label>
          <label className="flex items-center gap-2 text-monarch-black/80">
            <input type="radio" name="hostedBefore" value="No" required /> {t("no")}
          </label>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="heardFrom">{t("heardFrom")}</label>
        <input className={inputClass} id="heardFrom" name="heardFrom" />
      </div>

      <div>
        <label className={labelClass} htmlFor="comments">{t("comments")}</label>
        <textarea className={inputClass} id="comments" name="comments" rows={4} />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full sm:w-auto bg-monarch-orange hover:bg-monarch-orange-dark disabled:opacity-60 transition-colors text-cream px-8 py-3 rounded-full font-medium"
      >
        {status === "submitting" ? t("sending") : t("submit")}
      </button>
    </form>
  );
}
