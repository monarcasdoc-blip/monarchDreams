"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-lg border border-monarch-black/20 bg-white px-4 py-2.5 text-monarch-black focus:outline-none focus:ring-2 focus:ring-monarch-orange";
const labelClass = "block text-sm font-medium text-monarch-black/80 mb-1.5";

type Status = "idle" | "submitting" | "success" | "error";

export default function PlantMilkweedForm() {
  const t = useTranslations("PlantMilkweed");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    const form = e.currentTarget;
    const data = new FormData(form);

    if (!data.get("consent")) {
      setStatus("error");
      setErrorMessage(t("consentRequired"));
      return;
    }

    const photo = data.get("photo") as File | null;
    if (!photo || photo.size === 0) {
      setStatus("error");
      setErrorMessage(t("uploadError"));
      return;
    }

    if (!supabase) {
      setStatus("error");
      setErrorMessage(t("genericError"));
      return;
    }

    setStatus("submitting");

    const fileExt = photo.name.split(".").pop() || "jpg";
    const filePath = `${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("milkweed-photos")
      .upload(filePath, photo);

    if (uploadError) {
      setStatus("error");
      setErrorMessage(t("uploadError"));
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("milkweed-photos").getPublicUrl(filePath);

    try {
      const res = await fetch("/api/plant-milkweed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: data.get("displayName"),
          email: data.get("email"),
          address: data.get("address"),
          photoUrl: publicUrl,
        }),
      });

      if (!res.ok) {
        const resBody = await res.json().catch(() => ({}));
        throw new Error(resBody.error || t("genericError"));
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
      <div>
        <label className={labelClass} htmlFor="displayName">{t("displayName")}</label>
        <input className={inputClass} id="displayName" name="displayName" />
      </div>

      <div>
        <label className={labelClass} htmlFor="email">{t("email")} *</label>
        <input className={inputClass} id="email" name="email" type="email" required />
        <p className="text-xs text-monarch-black/50 mt-1">{t("emailNote")}</p>
      </div>

      <div>
        <label className={labelClass} htmlFor="address">{t("address")} *</label>
        <input className={inputClass} id="address" name="address" required />
        <p className="text-xs text-monarch-black/50 mt-1">{t("addressNote")}</p>
      </div>

      <div>
        <label className={labelClass} htmlFor="photo">{t("photo")} *</label>
        <input
          className={inputClass}
          id="photo"
          name="photo"
          type="file"
          accept="image/*"
          required
        />
      </div>

      <label className="flex items-start gap-2 text-sm text-monarch-black/80">
        <input type="checkbox" name="consent" className="mt-1" required />
        {t("consent")}
      </label>

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
