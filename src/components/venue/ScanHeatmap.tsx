"use client";

export type HourlyCell = { day: string; hour: number; total_scans: number };

/**
 * Heatmap: rows = last 7 days (newest first), cols = 24h. Peak hours summary above.
 */
export function ScanHeatmap({ data }: { data: HourlyCell[] }) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 p-6 text-center text-sm text-slate-500 dark:text-slate-400">
        No scan data yet. Verifications will appear here by day and hour.
      </div>
    );
  }

  const byKey = (day: string, hour: number) => `${day}-${hour}`;
  const map = new Map<string, number>();
  for (const row of data) {
    const k = byKey(row.day, row.hour);
    map.set(k, (map.get(k) ?? 0) + row.total_scans);
  }

  const days = Array.from(new Set(data.map((d) => d.day))).sort();
  const last7 = days.slice(-7);
  const maxCount = Math.max(1, ...Array.from(map.values()));

  // Peak hours: sum scans by hour across all days, sort desc
  const byHour: Record<number, number> = {};
  for (let h = 0; h < 24; h++) byHour[h] = 0;
  for (const row of data) {
    byHour[row.hour] = (byHour[row.hour] ?? 0) + row.total_scans;
  }
  const peakHours = (Object.entries(byHour) as [string, number][])
    .map(([h, n]) => ({ hour: parseInt(h, 10), count: n }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const formatHour = (h: number) => {
    if (h === 0) return "12a";
    if (h === 12) return "12p";
    return h < 12 ? `${h}a` : `${h - 12}p`;
  };

  const formatDayShort = (iso: string) => {
    const d = new Date(iso + "Z");
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-4">
      {peakHours.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
            Peak scan times (last 7 days)
          </h3>
          <div className="flex flex-wrap gap-2">
            {peakHours.map(({ hour, count }) => (
              <span
                key={hour}
                className="inline-flex items-center rounded-md bg-slate-200 dark:bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                {formatHour(hour)} <span className="ml-1 text-slate-500 dark:text-slate-400">({count})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
          Scans by day and hour (UTC)
        </h3>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-0">
            {/* Hour labels */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 pb-1 mb-1">
              <div className="w-24 flex-shrink-0 text-xs text-slate-500 dark:text-slate-400" aria-hidden />
              <div className="flex gap-0.5">
                {Array.from({ length: 24 }, (_, h) => (
                  <div
                    key={h}
                    className="w-3.5 h-4 flex items-center justify-center text-[10px] text-slate-400 dark:text-slate-500"
                    title={`${formatHour(h)}`}
                  >
                    {h % 3 === 0 ? formatHour(h) : ""}
                  </div>
                ))}
              </div>
            </div>
            {/* Rows: day + 24 cells */}
            {last7.length > 0 ? (
              [...last7].reverse().map((day) => (
                <div key={day} className="flex items-center gap-1 py-0.5">
                  <div className="w-24 flex-shrink-0 text-xs text-slate-600 dark:text-slate-400 truncate" title={day}>
                    {formatDayShort(day)}
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 24 }, (_, hour) => {
                      const count = map.get(byKey(day, hour)) ?? 0;
                      const intensity = maxCount > 0 ? count / maxCount : 0;
                      const bg =
                        intensity === 0
                          ? "bg-slate-100 dark:bg-slate-800/50"
                          : intensity < 0.25
                            ? "bg-emerald-300 dark:bg-emerald-900/60"
                            : intensity < 0.5
                              ? "bg-emerald-400 dark:bg-emerald-700/70"
                              : intensity < 0.75
                                ? "bg-emerald-500 dark:bg-emerald-600/80"
                                : "bg-emerald-600 dark:bg-emerald-500";
                      return (
                        <div
                          key={hour}
                          className={`w-3.5 h-4 rounded-sm ${bg} transition-opacity hover:opacity-90`}
                          title={`${formatDayShort(day)} ${formatHour(hour)}: ${count} scans`}
                          aria-label={`${count} scans`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-2">No daily data in range.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
