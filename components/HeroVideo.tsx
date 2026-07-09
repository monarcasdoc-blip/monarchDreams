"use client";

import { useEffect, useRef, useState } from "react";

type Clip = string | { src: string; objectPosition?: string };

function resolveClip(clip: Clip, fallbackPosition: string) {
  return typeof clip === "string"
    ? { src: clip, objectPosition: fallbackPosition }
    : { src: clip.src, objectPosition: clip.objectPosition ?? fallbackPosition };
}

const FADE_MS = 700;

export default function HeroVideo({
  src,
  objectPosition = "center",
}: {
  src: Clip | Clip[];
  objectPosition?: string;
}) {
  const clips = Array.isArray(src) ? src : [src];
  const length = clips.length;
  const [activeSlot, setActiveSlot] = useState(0);
  // Which clip index each of the two slots is currently displaying.
  const [slotClipIndex, setSlotClipIndex] = useState<[number, number]>([0, 1 % Math.max(length, 1)]);
  const slotRefs = [useRef<HTMLVideoElement | null>(null), useRef<HTMLVideoElement | null>(null)];
  const swapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  }, [activeSlot]);

  useEffect(() => {
    return () => {
      if (swapTimeoutRef.current) clearTimeout(swapTimeoutRef.current);
    };
  }, []);

  function handleEnded() {
    const finishedSlot = activeSlot;
    const nextSlot = finishedSlot === 0 ? 1 : 0;
    // The other slot is already preloaded with the next clip — just reveal it.
    setActiveSlot(nextSlot);
    // Only AFTER the crossfade finishes do we repoint the now-hidden slot at
    // the clip after next. Swapping its src any earlier — while it's still
    // fading out and partially visible — is what caused the wrong clip to
    // flash through on every transition.
    if (swapTimeoutRef.current) clearTimeout(swapTimeoutRef.current);
    swapTimeoutRef.current = setTimeout(() => {
      setSlotClipIndex((prev) => {
        const updated: [number, number] = [...prev];
        updated[finishedSlot] = (prev[nextSlot] + 1) % length;
        return updated;
      });
    }, FADE_MS);
  }

  if (length === 1) {
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
        const clip = resolveClip(clips[slotClipIndex[slot]], objectPosition);

        return (
          <video
            key={slot}
            ref={slotRefs[slot]}
            src={clip.src}
            muted
            playsInline
            preload="auto"
            onEnded={isActive ? handleEnded : undefined}
            className="absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out"
            style={{
              objectPosition: clip.objectPosition,
              opacity: isActive ? 1 : 0,
              transitionDuration: `${FADE_MS}ms`,
            }}
          />
        );
      })}
      <div className="absolute inset-0 bg-monarch-black/45" />
    </div>
  );
}
