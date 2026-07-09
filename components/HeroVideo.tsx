"use client";

import { useEffect, useRef, useState } from "react";

type Clip = string | { src: string; objectPosition?: string };

function resolveClip(clip: Clip, fallbackPosition: string) {
  return typeof clip === "string"
    ? { src: clip, objectPosition: fallbackPosition }
    : { src: clip.src, objectPosition: clip.objectPosition ?? fallbackPosition };
}

export default function HeroVideo({
  src,
  objectPosition = "center",
}: {
  src: Clip | Clip[];
  objectPosition?: string;
}) {
  const clips = Array.isArray(src) ? src : [src];
  const [index, setIndex] = useState(0);
  const slotRefs = [useRef<HTMLVideoElement | null>(null), useRef<HTMLVideoElement | null>(null)];
  const activeSlot = index % 2;

  useEffect(() => {
    const activeVideo = slotRefs[activeSlot].current;
    if (!activeVideo) return;
    activeVideo.currentTime = 0;
    const tryPlay = () => activeVideo.play().catch(() => {});
    tryPlay();

    // Chrome pauses autoplaying video-only (no audio track) elements to save
    // power while the tab is backgrounded/hidden. Resume automatically once
    // the tab is visible again instead of leaving the clip frozen.
    const resumeIfVisible = () => {
      if (document.visibilityState === "visible" && activeVideo.paused) {
        tryPlay();
      }
    };
    document.addEventListener("visibilitychange", resumeIfVisible);
    return () => document.removeEventListener("visibilitychange", resumeIfVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (clips.length === 1) {
    const clip = resolveClip(clips[0], objectPosition);
    return (
      <div className="absolute inset-0">
        <video
          src={clip.src}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: clip.objectPosition }}
        />
        <div className="absolute inset-0 bg-monarch-black/45" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      {[0, 1].map((slot) => {
        const isActive = slot === activeSlot;
        // Only two <video> elements ever exist. The active one always shows
        // clips[index]; the other sits hidden and preloads clips[index + 1] —
        // whatever it's already showing when it next becomes active. Its src
        // only ever changes while it's hidden (opacity 0), so the visible
        // element's source never changes underneath the viewer, and onEnded
        // only lives on the active slot so a hidden/finished clip can never
        // spuriously advance the cycle. That combination is what avoids any
        // flash — of black or of the wrong clip — between transitions.
        const clipIndex = isActive ? index : (index + 1) % clips.length;
        const clip = resolveClip(clips[clipIndex], objectPosition);

        return (
          <video
            key={slot}
            ref={slotRefs[slot]}
            src={clip.src}
            muted
            playsInline
            preload="auto"
            onEnded={isActive ? () => setIndex((prev) => (prev + 1) % clips.length) : undefined}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out"
            style={{ objectPosition: clip.objectPosition, opacity: isActive ? 1 : 0 }}
          />
        );
      })}
      <div className="absolute inset-0 bg-monarch-black/45" />
    </div>
  );
}
