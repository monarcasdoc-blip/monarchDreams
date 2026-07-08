"use client";

import { useState } from "react";

type Clip = string | { src: string; objectPosition?: string };

export default function HeroVideo({
  src,
  objectPosition = "center",
}: {
  src: Clip | Clip[];
  objectPosition?: string;
}) {
  const clips = Array.isArray(src) ? src : [src];
  const [index, setIndex] = useState(0);
  const current = clips[index];
  const currentSrc = typeof current === "string" ? current : current.src;
  const currentPosition =
    typeof current === "string" ? objectPosition : current.objectPosition ?? objectPosition;

  return (
    <div className="absolute inset-0">
      <video
        key={currentSrc}
        src={currentSrc}
        autoPlay
        muted
        loop={clips.length === 1}
        playsInline
        onEnded={() => setIndex((i) => (i + 1) % clips.length)}
        className="h-full w-full object-cover"
        style={{ objectPosition: currentPosition }}
      />
      <div className="absolute inset-0 bg-monarch-black/45" />
    </div>
  );
}
