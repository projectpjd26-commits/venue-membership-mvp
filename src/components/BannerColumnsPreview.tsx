"use client";

/**
 * Decorative animated banner columns for the splash — suggests the owner's venue launcher
 * without real venue names or links. Placeholder cards only.
 */

const PLACEHOLDERS = [
  { label: "Venue", gradient: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)" },
  { label: "Venue", gradient: "linear-gradient(135deg, #312e81 0%, #4338ca 50%, #6366f1 100%)" },
  { label: "Venue", gradient: "linear-gradient(135deg, #422006 0%, #b45309 50%, #d97706 100%)" },
  { label: "Venue", gradient: "linear-gradient(135deg, #134e4a 0%, #0f766e 50%, #14b8a6 100%)" },
  { label: "Venue", gradient: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a78bfa 100%)" },
  { label: "Venue", gradient: "linear-gradient(135deg, #1e3a5f 0%, #0369a1 50%, #0ea5e9 100%)" },
];

function PlaceholderCard({
  label,
  gradient,
  className = "",
}: {
  label: string;
  gradient: string;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden aspect-[3/5] min-h-[200px] sm:min-h-[240px] flex-shrink-0 ${className}`}
      aria-hidden
    >
      <span
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ background: gradient }}
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/25" />
      <span className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
        <span className="font-semibold text-amber-400 drop-shadow-lg text-lg sm:text-xl">
          {label}
        </span>
      </span>
    </div>
  );
}

export function BannerColumnsPreview() {
  return (
    <section className="w-full overflow-hidden bg-slate-100 dark:bg-slate-900/50 py-20">
      <div className="max-w-6xl mx-auto px-6 text-center mb-12">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Your venues at a glance
        </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
          Sign in to see your venue launcher — switch between spaces in one place.
        </p>
      </div>

      <div className="flex justify-center gap-6 md:gap-10 px-4">
        {/* Column 1 — scrolls up */}
        <div className="flex flex-col gap-4 banner-column-up">
          {PLACEHOLDERS.slice(0, 3).map((p, i) => (
            <PlaceholderCard key={`c1-${i}`} label={p.label} gradient={p.gradient} />
          ))}
          {PLACEHOLDERS.slice(0, 2).map((p, i) => (
            <PlaceholderCard key={`c1-dup-${i}`} label={p.label} gradient={p.gradient} />
          ))}
        </div>

        {/* Column 2 — scrolls down */}
        <div className="flex flex-col gap-4 banner-column-down" style={{ animationDelay: "-4s" }}>
          {PLACEHOLDERS.slice(2, 5).map((p, i) => (
            <PlaceholderCard key={`c2-${i}`} label={p.label} gradient={p.gradient} />
          ))}
          {PLACEHOLDERS.slice(2, 4).map((p, i) => (
            <PlaceholderCard key={`c2-dup-${i}`} label={p.label} gradient={p.gradient} />
          ))}
        </div>

        {/* Column 3 — scrolls up, different speed */}
        <div className="flex flex-col gap-4 banner-column-up-slow" style={{ animationDelay: "-8s" }}>
          {PLACEHOLDERS.slice(3, 6).map((p, i) => (
            <PlaceholderCard key={`c3-${i}`} label={p.label} gradient={p.gradient} />
          ))}
          {PLACEHOLDERS.slice(4, 6).map((p, i) => (
            <PlaceholderCard key={`c3-dup-${i}`} label={p.label} gradient={p.gradient} />
          ))}
        </div>
      </div>
    </section>
  );
}
