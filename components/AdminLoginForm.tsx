"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { LoginStrings } from "@/app/admin/dictionary";

export default function AdminLoginForm({ t }: { t: LoginStrings }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || t.error);
      }

      setPassword("");
      // The page is a server component gated on the cookie the route just set,
      // so re-render it from the server rather than tracking auth in the client.
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm px-6 py-24">
      <h1 className="font-display text-2xl mb-2">{t.heading}</h1>
      <p className="text-sm text-monarch-black/60 mb-8">{t.subtitle}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium text-monarch-black/80 mb-1.5"
            htmlFor="password"
          >
            {t.passwordLabel}
          </label>
          <input
            className="w-full rounded-lg border border-monarch-black/20 bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-monarch-orange"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-monarch-orange hover:bg-monarch-orange-dark disabled:opacity-60 transition-colors text-cream px-8 py-3 rounded-full font-medium"
        >
          {submitting ? t.signingIn : t.signIn}
        </button>
      </form>
    </main>
  );
}
