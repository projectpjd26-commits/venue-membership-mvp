"use client";

/**
 * Decorative animated banner rows for the splash — three rows scrolling horizontally.
 * Mock venue names (no real data). Suggests the owner's venue launcher.
 */

const MOCK_VENUES = [
  { name: "The Function SF", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80", gradient: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)" },
  { name: "The Starry Plough", image: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=400&q=80", gradient: "linear-gradient(135deg, #312e81 0%, #4338ca 50%, #6366f1 100%)" },
  { name: "Pacific Greens", image: "https://images.unsplash.com/photo-1545128485-c400e7702796?w=400&q=80", gradient: "linear-gradient(135deg, #134e4a 0%, #0f766e 50%, #14b8a6 100%)" },
  { name: "La Rueda", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80", gradient: "linear-gradient(135deg, #422006 0%, #b45309 50%, #d97706 100%)" },
  { name: "Strike Zone", image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&q=80", gradient: "linear-gradient(135deg, #1e3a5f 0%, #0369a1 50%, #0ea5e9 100%)" },
  { name: "The Velvet Room", image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&q=80", gradient: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #a78bfa 100%)" },
  { name: "The Hideout", image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&q=80", gradient: "linear-gradient(135deg, #451a03 0%, #9a3412 50%, #c2410c 100%)" },
  { name: "Bar None", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80", gradient: "linear-gradient(135deg, #1c1917 0%, #44403c 50%, #78716c 100%)" },
];

function PlaceholderCard({
  name,
  image,
  gradient,
  className = "",
}: {
  name: string;
  image: string;
  gradient: string;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-none overflow-hidden aspect-[3/5] w-[160px] min-h-[267px] sm:w-[200px] sm:min-h-[334px] flex-shrink-0 ${className}`}
      aria-hidden
    >
      <span
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={image ? { backgroundImage: `url(${image})` } : { background: gradient }}
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/25" />
      <span className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
        <span className="font-semibold text-amber-400 drop-shadow-lg text-sm sm:text-base line-clamp-2">
          {name}
        </span>
      </span>
    </div>
  );
}

export function BannerColumnsPreview() {
  return (
    <section className="relative w-full overflow-hidden bg-slate-950 py-16 min-h-[520px]">
      {/* Moving venue rows — fewer, larger cards */}
      <div className="flex flex-col gap-0">
        {/* Row 1 — scrolls left, 3 venues per set */}
        <div className="w-full overflow-hidden">
          <div className="flex gap-0 w-max banner-row-left">
            {MOCK_VENUES.slice(0, 3).map((v, i) => (
              <PlaceholderCard key={`r1-${i}`} name={v.name} image={v.image} gradient={v.gradient} />
            ))}
            {MOCK_VENUES.slice(0, 3).map((v, i) => (
              <PlaceholderCard key={`r1-dup-${i}`} name={v.name} image={v.image} gradient={v.gradient} />
            ))}
          </div>
        </div>

        {/* Row 2 — scrolls right */}
        <div className="w-full overflow-hidden">
          <div className="flex gap-0 w-max banner-row-right" style={{ animationDelay: "-5s" }}>
            {MOCK_VENUES.slice(2, 5).map((v, i) => (
              <PlaceholderCard key={`r2-${i}`} name={v.name} image={v.image} gradient={v.gradient} />
            ))}
            {MOCK_VENUES.slice(2, 5).map((v, i) => (
              <PlaceholderCard key={`r2-dup-${i}`} name={v.name} image={v.image} gradient={v.gradient} />
            ))}
          </div>
        </div>

        {/* Row 3 — scrolls left, different speed */}
        <div className="w-full overflow-hidden">
          <div className="flex gap-0 w-max banner-row-left-slow" style={{ animationDelay: "-12s" }}>
            {MOCK_VENUES.slice(4, 7).map((v, i) => (
              <PlaceholderCard key={`r3-${i}`} name={v.name} image={v.image} gradient={v.gradient} />
            ))}
            {MOCK_VENUES.slice(4, 7).map((v, i) => (
              <PlaceholderCard key={`r3-dup-${i}`} name={v.name} image={v.image} gradient={v.gradient} />
            ))}
          </div>
        </div>
      </div>

      {/* Overlay title — bigger, bolder, centered on the motion */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 pointer-events-none">
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white text-center drop-shadow-[0_2px_20px_rgba(0,0,0,0.9)] [text-shadow:0_0_40px_rgba(0,0,0,0.8)]">
          LIVE VENUES ON COTERI
        </h2>
      </div>
    </section>
  );
}
