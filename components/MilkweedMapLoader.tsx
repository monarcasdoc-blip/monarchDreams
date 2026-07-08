"use client";

import dynamic from "next/dynamic";
import type { MilkweedPin } from "@/lib/milkweed";

// Leaflet touches `window` while rendering, so it can never be part of the
// server-rendered pass — ssr:false has to live inside a Client Component.
const MilkweedMap = dynamic(() => import("./MilkweedMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full rounded-xl bg-monarch-black/5 animate-pulse" />
  ),
});

export default function MilkweedMapLoader({ pins }: { pins: MilkweedPin[] }) {
  return <MilkweedMap pins={pins} />;
}
