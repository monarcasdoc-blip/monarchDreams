"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-lg border border-monarch-black/20 bg-white px-4 py-2.5 text-monarch-black focus:outline-none focus:ring-2 focus:ring-monarch-orange";
const labelClass = "block text-sm font-medium text-monarch-black/80 mb-1.5";

type Status = "idle" | "submitting" | "error";

export default function OfficialPinForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setNotice("");
    setStatus("submitting");

    const form = e.currentTarget;
    const data = new FormData(form);

    // Photo is optional here, unlike public submissions — Claudia can drop a pin
    // for a planting she has no good photo of yet.
    let photoUrl: string | undefined;
    const photo = data.get("photo") as File | null;

    if (photo && photo.size > 0) {
      if (!supabase) {
        setStatus("error");
        setErrorMessage("Supabase isn't configured, so the photo can't upload.");
        return;
      }

      const fileExt = photo.name.split(".").pop() || "jpg";
      const filePath = `official/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("milkweed-photos")
        .upload(filePath, photo);

      if (uploadError) {
        setStatus("error");
        setErrorMessage("The photo failed to upload. Please try again.");
        return;
      }

      photoUrl = supabase.storage.from("milkweed-photos").getPublicUrl(filePath)
        .data.publicUrl;
    }

    try {
      const res = await fetch("/api/admin/official-pins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteName: data.get("siteName"),
          address: data.get("address"),
          description: data.get("description"),
          milkweedCount: data.get("milkweedCount"),
          eventName: data.get("eventName"),
          eventDate: data.get("eventDate"),
          photoUrl,
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Failed to add the pin.");

      form.reset();
      setStatus("idle");
      setNotice(
        `Added “${data.get("siteName")}” at ${Number(body.lat).toFixed(4)}, ${Number(
          body.lng
        ).toFixed(4)}. Check the map to confirm it landed in the right spot.`
      );
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to add the pin.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass} htmlFor="siteName">
          Site name *
        </label>
        <input
          className={inputClass}
          id="siteName"
          name="siteName"
          placeholder="La Villita Community Garden"
          required
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="address">
          Address *
        </label>
        <input
          className={inputClass}
          id="address"
          name="address"
          placeholder="1800 S Blue Island Ave, Chicago, IL"
          required
        />
        <p className="text-xs text-monarch-black/50 mt-1">
          Geocoded automatically. Include the city and state — the pin shows at this
          exact spot, so use public sites only.
        </p>
      </div>

      <div>
        <label className={labelClass} htmlFor="milkweedCount">
          Number of milkweed
        </label>
        <input
          className={inputClass}
          id="milkweedCount"
          name="milkweedCount"
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          placeholder="200"
        />
        <p className="text-xs text-monarch-black/50 mt-1">
          Optional — leave blank if you don&apos;t have an exact number.
        </p>
      </div>

      <fieldset className="border border-monarch-black/15 rounded-lg p-4">
        <legend className="text-sm font-medium text-monarch-black/80 px-1">
          Event (optional)
        </legend>
        <p className="text-xs text-monarch-black/50 mb-3">
          Fill this in if the planting happened as part of an event — a community
          planting day, a school workshop.
        </p>

        <div className="mb-4">
          <label className={labelClass} htmlFor="eventName">
            Event name
          </label>
          <input
            className={inputClass}
            id="eventName"
            name="eventName"
            placeholder="Pilsen Community Planting Day"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="eventDate">
            Event date
          </label>
          <input className={inputClass} id="eventDate" name="eventDate" type="date" />
        </div>
      </fieldset>

      <div>
        <label className={labelClass} htmlFor="description">
          Description
        </label>
        <textarea
          className={inputClass}
          id="description"
          name="description"
          rows={2}
          placeholder="Planted with neighborhood volunteers along the garden's south wall."
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="photo">
          Photo
        </label>
        <input className={inputClass} id="photo" name="photo" type="file" accept="image/*" />
        <p className="text-xs text-monarch-black/50 mt-1">Optional.</p>
      </div>

      {status === "error" && <p className="text-sm text-red-600">{errorMessage}</p>}
      {notice && <p className="text-sm text-milkweed-green-dark">{notice}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="bg-monarch-orange hover:bg-monarch-orange-dark disabled:opacity-60 transition-colors text-cream px-8 py-3 rounded-full font-medium"
      >
        {status === "submitting" ? "Adding…" : "Add pin"}
      </button>
    </form>
  );
}
