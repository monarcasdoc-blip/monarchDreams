"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SubmissionsStrings } from "@/app/admin/dictionary";

export type PendingSubmission = {
  id: string;
  display_name: string | null;
  plant_name: string | null;
  email: string;
  address: string;
  photo_url: string | null;
  created_at: string;
};

type Action = "approve" | "reject";

export default function PendingSubmissions({
  submissions,
  t,
}: {
  submissions: PendingSubmission[];
  t: SubmissionsStrings;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<Action | null>(null);
  const [error, setError] = useState("");

  async function act(id: string, action: Action) {
    setError("");
    setBusyId(id);
    setBusyAction(action);

    try {
      const res = await fetch("/api/admin/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || t.error);

      // Re-render the server component so the just-handled row drops off the list.
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
    } finally {
      setBusyId(null);
      setBusyAction(null);
    }
  }

  if (submissions.length === 0) {
    return <p className="text-monarch-black/60 italic text-sm">{t.none}</p>;
  }

  return (
    <>
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      <ul className="divide-y divide-monarch-black/10 border-t border-monarch-black/10">
        {submissions.map((s) => {
          const busy = busyId === s.id;
          const name = s.display_name?.trim();
          const plant = s.plant_name?.trim();
          return (
            <li key={s.id} className="py-4 flex gap-4">
              {s.photo_url && (
                <a
                  href={s.photo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.photo_url}
                    alt=""
                    className="w-20 h-20 object-cover rounded-md"
                  />
                </a>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {plant && <span className="text-monarch-orange">“{plant}”</span>}
                  {plant && name && <span className="text-monarch-black/40"> · </span>}
                  {name || (!plant && t.noName)}
                </p>
                {s.address && (
                  <p className="text-sm text-monarch-black/60">{s.address}</p>
                )}
                <p className="text-sm text-monarch-black/50 break-all">{s.email}</p>
                <div className="mt-2.5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => act(s.id, "approve")}
                    disabled={busy}
                    className="rounded-full bg-milkweed-green px-4 py-1.5 text-sm font-medium text-cream hover:bg-milkweed-green-dark transition-colors disabled:opacity-60"
                  >
                    {busy && busyAction === "approve" ? t.approving : t.approve}
                  </button>
                  <button
                    type="button"
                    onClick={() => act(s.id, "reject")}
                    disabled={busy}
                    className="rounded-full border border-monarch-black/25 px-4 py-1.5 text-sm font-medium text-monarch-black/70 hover:bg-monarch-black/5 transition-colors disabled:opacity-60"
                  >
                    {busy && busyAction === "reject" ? t.rejecting : t.reject}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
