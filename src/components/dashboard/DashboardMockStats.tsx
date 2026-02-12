"use client";

/**
 * Mock vendor statistics for demo. Optional venueName scopes the heading to the selected venue.
 * Not wired to real data.
 */
export function DashboardMockStats({ venueName }: { venueName?: string | null } = {}) {
  void venueName; // reserved for venue-scoped heading
  return (
    <section className="mt-6">
      <h2 className="text-sm font-medium mb-3" style={{ color: "var(--venue-text-muted)" }}>
        Venue verification (demo)
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Today" value="24" sub="valid" />
        <StatCard label="Today" value="2" sub="invalid" />
        <StatCard label="Week" value="312" sub="valid" />
        <StatCard label="Week" value="18" sub="invalid" />
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div
      className="rounded-lg border border-white/10 px-3 py-2.5"
      style={{ backgroundColor: "var(--venue-bg-elevated)" }}
    >
      <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--venue-text-muted)" }}>{label} · {sub}</p>
      <p className="text-lg font-semibold" style={{ color: "var(--venue-text)" }}>{value}</p>
    </div>
  );
}
