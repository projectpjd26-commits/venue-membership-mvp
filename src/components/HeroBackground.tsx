"use client";

/**
 * Cinematic multi-panel hero background — diagonal slices, seamless horizontal drift.
 * Slow, architectural, production-grade. No gimmicks.
 */

function Panel({
  image,
  clip,
}: {
  image: string;
  clip: "clip-left" | "clip-middle" | "clip-right";
}) {
  return (
    <div className={`relative flex-[0_0_16.666%] h-full overflow-hidden ${clip}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover blur-[4px] scale-110 saturate-[0.85] contrast-[1.05]"
      />
      {/* Softens diagonal edges — blended, not sliced */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent pointer-events-none" aria-hidden />
    </div>
  );
}

const VENUE_IMAGES = [
  "/venues/3.png",
  "/venues/4.png",
  "/venues/IMG.png",
];

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden [box-shadow:inset_0_0_160px_rgba(0,0,0,0.2)] transition-opacity duration-1000 group-hover:opacity-80">
      {/* Moving Strip — 6 panels (3 + duplicate) for seamless loop */}
      <div className="absolute inset-0 flex w-[200%] animate-cinematic-loop">
        <Panel image={VENUE_IMAGES[0]} clip="clip-left" />
        <Panel image={VENUE_IMAGES[1]} clip="clip-middle" />
        <Panel image={VENUE_IMAGES[2]} clip="clip-right" />
        <Panel image={VENUE_IMAGES[0]} clip="clip-left" />
        <Panel image={VENUE_IMAGES[1]} clip="clip-middle" />
        <Panel image={VENUE_IMAGES[2]} clip="clip-right" />
      </div>

      {/* Authority Overlay — light so venue drift is clearly visible */}
      <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px] pointer-events-none" aria-hidden />

      {/* Atmospheric depth — light stage lighting */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 via-slate-950/35 to-slate-950/55 pointer-events-none" aria-hidden />

      {/* Indigo Atmosphere */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-indigo-500/10 blur-[180px] rounded-full pointer-events-none"
        aria-hidden
      />

      {/* Volumetric light shafts — ultra subtle (≤5%) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute top-0 left-1/4 w-[600px] h-[1200px] bg-indigo-500/5 blur-[120px] rotate-12" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[1000px] bg-indigo-400/5 blur-[120px] -rotate-12" />
      </div>

      {/* Foreground particle drift — barely visible, alive */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute w-1 h-1 bg-white/10 rounded-full animate-particle-drift top-[20%] left-[30%]" />
        <div className="absolute w-1 h-1 bg-white/10 rounded-full animate-particle-drift2 top-[60%] left-[70%]" />
      </div>
    </div>
  );
}
