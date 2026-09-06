"use client";

import { useEffect, useRef, useState } from "react";

const VIDEO_SRC = "https://strvid.nyc3.cdn.digitaloceanspaces.com/motionsite/hero_robo_video.mp4";

type VideoState = "loading" | "ready" | "error";

/**
 * Decorative hero companion video (white-background 3D robot, external CDN —
 * origin allow-listed in next.config CSP `media-src`).
 *
 * Client component because React does not serialize the `muted` attribute
 * during SSR, which silently blocks autoplay in Chromium — the ref sets it
 * before calling play().
 *
 * Robustness rules:
 * - A CSS/SVG "robot orb" fallback is ALWAYS rendered underneath, so the frame
 *   is never blank while the 3 MB clip buffers, and it stays visible if the
 *   CDN is unreachable (offline, blocked network, CSP, slow 3G…).
 * - The video fades in only once the browser has actually rendered frames
 *   (`playing` / `loadeddata`), never before.
 * - Playback pauses while scrolled out of view to keep the main thread free.
 * - Reduced-motion visitors keep the static fallback (no autoplaying media).
 */
export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<VideoState>("loading");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reduced-motion visitors keep the static fallback: the video is never
    // loaded, so `state` stays "loading" and the clip stays invisible.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // React does not serialise `muted`; set it before any play() attempt.
    video.muted = true;
    video.defaultMuted = true;

    const markReady = () => setState("ready");
    const markError = () => setState("error");
    const tryPlay = () => {
      video.play().catch(() => {
        // Autoplay can be refused by strict browser policies — keep the
        // fallback visible instead of a frozen blank frame.
        if (video.readyState < 2) setState("error");
      });
    };

    video.addEventListener("loadeddata", markReady);
    video.addEventListener("playing", markReady);
    video.addEventListener("error", markError);
    video.addEventListener("stalled", () => {
      if (video.readyState < 2) markError();
    });

    // Safety net: if nothing decoded after 12s, show the fallback for good.
    const timeout = window.setTimeout(() => {
      if (video.readyState < 2) markError();
    }, 12_000);

    // Start fetching only after hydration; play when visible, pause when not.
    video.load();
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) tryPlay();
        else video.pause();
      },
      { threshold: 0 },
    );
    observer.observe(video);

    return () => {
      window.clearTimeout(timeout);
      observer.disconnect();
      video.removeEventListener("loadeddata", markReady);
      video.removeEventListener("playing", markReady);
      video.removeEventListener("error", markError);
    };
  }, []);

  const showVideo = state === "ready";

  return (
    <div
      className="relative aspect-square w-full max-w-[600px] select-none overflow-hidden rounded-[20px] bg-white"
      aria-hidden="true"
    >
      {/* Always-present fallback: keeps the frame designed even without media */}
      <RobotFallback dimmed={showVideo} />

      <video
        ref={videoRef}
        tabIndex={-1}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${
          showVideo ? "opacity-100" : "opacity-0"
        }`}
        style={{ filter: "brightness(1.02) contrast(1.04)" }}
        loop
        muted
        playsInline
        preload="none"
        disablePictureInPicture
        disableRemotePlayback
        src={VIDEO_SRC}
      />
    </div>
  );
}

/**
 * Pure CSS/SVG stand-in for the robot clip: a floating glossy orb with a
 * friendly visor, orbit ring and soft brand glow. No network, CSP-safe.
 */
function RobotFallback({ dimmed }: { dimmed: boolean }) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${
        dimmed ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgb(59_108_246/0.16),transparent_58%),linear-gradient(180deg,#ffffff_0%,#f5f7fb_100%)]" />
      <div className="absolute inset-0 bg-dots opacity-60 [mask-image:radial-gradient(circle_at_50%_45%,black,transparent_75%)]" />

      <div className="relative h-[62%] w-[62%] animate-float-slow">
        {/* Orbit ring */}
        <svg
          viewBox="0 0 200 200"
          className="absolute -inset-[14%] h-[128%] w-[128%] animate-spin-slow text-brand-500/40"
          fill="none"
        >
          <ellipse cx="100" cy="100" rx="96" ry="34" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 8" />
          <circle cx="196" cy="100" r="4" fill="var(--color-accent-500)" />
        </svg>

        {/* Body */}
        <div className="absolute inset-[8%] rounded-[38%] bg-[linear-gradient(145deg,#ffffff_0%,#e6ecfb_45%,#c7d4f6_100%)] shadow-[0_30px_60px_-20px_rgb(37_87_232/0.45),inset_0_-14px_30px_rgb(37_87_232/0.12),inset_0_10px_20px_rgb(255_255_255/0.9)]" />

        {/* Visor */}
        <div className="absolute left-[24%] right-[24%] top-[34%] h-[22%] rounded-full bg-[linear-gradient(135deg,#0b1220_0%,#132a6b_60%,#2557e8_100%)] shadow-[inset_0_2px_6px_rgb(255_255_255/0.25),0_10px_24px_-8px_rgb(11_18_32/0.6)]">
          <span className="absolute left-[22%] top-[38%] h-[24%] w-[16%] rounded-full bg-cyan-300 shadow-[0_0_14px_rgb(103_232_249/0.9)]" />
          <span className="absolute right-[22%] top-[38%] h-[24%] w-[16%] rounded-full bg-cyan-300 shadow-[0_0_14px_rgb(103_232_249/0.9)]" />
          <span className="absolute inset-x-[10%] top-[10%] h-[30%] rounded-full bg-white/20 blur-[1px]" />
        </div>

        {/* Antenna */}
        <div className="absolute left-1/2 top-[-2%] h-[12%] w-[3%] -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,#7c3aed,#2557e8)]" />
        <div className="absolute left-1/2 top-[-8%] h-[8%] w-[8%] -translate-x-1/2 rounded-full bg-accent-500 shadow-[0_0_18px_rgb(124_58_237/0.7)] animate-pulse-ring" />

        {/* Ground shadow */}
        <div className="absolute inset-x-[18%] -bottom-[14%] h-[10%] rounded-full bg-brand-900/15 blur-xl" />
      </div>
    </div>
  );
}
