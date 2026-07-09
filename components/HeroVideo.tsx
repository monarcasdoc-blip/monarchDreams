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
  const swappedRef = useRef(false);

  function swapOutgoingSlot(slot: number) {
    if (swappedRef.current) return;
    swappedRef.current = true;
    const otherSlot = slot === 0 ? 1 : 0;
    setSlotClipIndex((prev) => {
      const updated: [number, number] = [...prev];
      updated[slot] = (prev[otherSlot] + 1) % length;
      return updated;
    });
  }

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

    // `transitionend` is the primary signal that the outgoing slot has
    // actually faded out, but browsers can suspend CSS transition events
    // entirely while the tab is backgrounded. This fallback (well past the
    // fade duration) guarantees the swap still happens eventually so a
    // backgrounded-then-resumed tab doesn't get stuck showing a stale clip.
    swappedRef.current = false;
    const outgoingSlot = activeSlot === 0 ? 1 : 0;
    const fallback = setTimeout(() => swapOutgoingSlot(outgoingSlot), FADE_MS + 300);

    return () => {
      document.removeEventListener("visibilitychange", resumeIfVisible);
      clearTimeout(fallback);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlot]);

  // Chrome can fire a spurious `ended` event on a video-only (no audio
  // track) element that got reset to 0 and then blocked from playing (e.g.
  // its background-media power-saving pause) — not just `pause`, a real
  // `ended`. Ignore anything that didn't actually happen at the clip's end,
  // or a stale/duplicate handler still attached to a slot that isn't
  // active anymore.
  function handleEnded(slot: number, event: React.SyntheticEvent<HTMLVideoElement>) {
    if (slot !== activeSlot) return;
    const video = event.currentTarget;
    if (!video.duration || video.duration - video.currentTime > 0.5) return;
    // The other slot is already preloaded with the next clip — just reveal it.
    setActiveSlot((prev) => (prev === 0 ? 1 : 0));
  }

  // Only once the outgoing slot's own fade-out has actually finished (per the
  // browser, not a guessed duration) do we repoint it at the clip after next.
  // Swapping its src any earlier — while it's still fading and partially
  // visible — is what caused the wrong clip to flash through on transitions.
  function handleTransitionEnd(slot: number, event: React.TransitionEvent<HTMLVideoElement>) {
    if (event.propertyName !== "opacity" || slot === activeSlot) return;
    swapOutgoingSlot(slot);
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
            onEnded={(e) => handleEnded(slot, e)}
            onTransitionEnd={(e) => handleTransitionEnd(slot, e)}
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
