import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { LiveVerificationCount } from "@/components/venue/LiveVerificationCount";
import { ScanHeatmap } from "@/components/venue/ScanHeatmap";

function formatDay(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function truncateId(id: string): string {
  if (id.length <= 8) return id;
  return `${id.slice(0, 4)}…${id.slice(-4)}`;
}

export default async function VenueMetricsPage() {
  const cookieStore = await cookies();
  const supabase = createServerSupabase(cookieStore, true);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/");
  }

  const ALLOWED_METRICS_ROLES = ["manager", "owner"] as const;
  const { data: currentUserStaff } = await supabase
    .from("venue_staff")
    .select("venue_id, role, venues(name)")
    .eq("user_id", session.user.id)
    .limit(1);
  const staffRecord = currentUserStaff?.[0] ?? null;

  if (
    !staffRecord?.venue_id ||
    !staffRecord.role ||
    !ALLOWED_METRICS_ROLES.includes(staffRecord.role as (typeof ALLOWED_METRICS_ROLES)[number])
  ) {
    redirect("/");
  }

  const venueId = staffRecord.venue_id;
  const venueName =
    staffRecord.venues &&
    typeof staffRecord.venues === "object" &&
    "name" in staffRecord.venues
      ? (staffRecord.venues as { name: string }).name
      : "—";

  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  let total24h: number | null = null;
  let valid24h: number | null = null;
  let invalid24h: number | null = null;
  let flagged24h: number | null = null;
  let todayApproved: number = 0;

  try {
    const startOfToday = new Date(now);
    startOfToday.setUTCHours(0, 0, 0, 0);
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setUTCDate(startOfTomorrow.getUTCDate() + 1);
    const todayStart = startOfToday.toISOString();
    const todayEnd = startOfTomorrow.toISOString();

    const [totalRes, validRes, invalidRes, flaggedRes, dailyView] = await Promise.all([
      supabase
        .from("verification_events")
        .select("id", { count: "exact", head: true })
        .eq("venue_id", venueId)
        .gte("occurred_at", twentyFourHoursAgo),
      supabase
        .from("verification_events")
        .select("id", { count: "exact", head: true })
        .eq("venue_id", venueId)
        .eq("result", "valid")
        .gte("occurred_at", twentyFourHoursAgo),
      supabase
        .from("verification_events")
        .select("id", { count: "exact", head: true })
        .eq("venue_id", venueId)
        .eq("result", "invalid")
        .gte("occurred_at", twentyFourHoursAgo),
      supabase
        .from("verification_events")
        .select("id", { count: "exact", head: true })
        .eq("venue_id", venueId)
        .not("flag_reason", "is", null)
        .gte("occurred_at", twentyFourHoursAgo),
      supabase
        .from("venue_daily_scans")
        .select("approved_scans")
        .eq("venue_id", venueId)
        .gte("day", todayStart)
        .lt("day", todayEnd)
        .maybeSingle(),
    ]);
    total24h = totalRes.count ?? null;
    valid24h = validRes.count ?? null;
    invalid24h = invalidRes.count ?? null;
    flagged24h = flaggedRes.count ?? null;
    todayApproved = (dailyView.data as { approved_scans?: number } | null)?.approved_scans ?? 0;
  } catch {
    // fail closed
  }

  type DailyRow = { date: string; total: number; valid: number; invalid: number };
  let dailyRows: DailyRow[] = [];

  try {
    const { data: events } = await supabase
      .from("verification_events")
      .select("occurred_at, result")
      .eq("venue_id", venueId)
      .gte("occurred_at", sevenDaysAgo);

    const byDay: Record<string, { total: number; valid: number; invalid: number }> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setUTCDate(d.getUTCDate() - i);
      const key = formatDay(d.toISOString());
      byDay[key] = { total: 0, valid: 0, invalid: 0 };
    }
    for (const row of events ?? []) {
      const day = formatDay(row.occurred_at);
      if (day in byDay) {
        byDay[day].total += 1;
        if (row.result === "valid") byDay[day].valid += 1;
        else if (row.result === "invalid") byDay[day].invalid += 1;
      }
    }
    dailyRows = Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => ({ date, ...counts }));
  } catch {
    // fail closed
  }

  type StaffRow = { staff_user_id: string; total: number; invalid: number; flagged: number };
  let staffRows: StaffRow[] = [];

  type TierUsageRow = { tier: string; total_scans: number };
  let tierUsageRows: TierUsageRow[] = [];

  try {
    const { data: events } = await supabase
      .from("verification_events")
      .select("staff_user_id, result, flag_reason")
      .eq("venue_id", venueId)
      .gte("occurred_at", sevenDaysAgo);

    const byStaff: Record<string, { total: number; invalid: number; flagged: number }> = {};
    for (const row of events ?? []) {
      const id = row.staff_user_id;
      if (!byStaff[id]) byStaff[id] = { total: 0, invalid: 0, flagged: 0 };
      byStaff[id].total += 1;
      if (row.result === "invalid") byStaff[id].invalid += 1;
      if (row.flag_reason != null) byStaff[id].flagged += 1;
    }
    staffRows = Object.entries(byStaff)
      .map(([staff_user_id, counts]) => ({ staff_user_id, ...counts }))
      .sort((a, b) => b.total - a.total);
  } catch {
    // fail closed
  }

  try {
    const { data: tierRows } = await supabase
      .from("venue_tier_usage")
      .select("tier, total_scans")
      .eq("venue_id", venueId);
    tierUsageRows = (tierRows ?? []) as TierUsageRow[];
  } catch {
    // view may not exist yet
  }

  type FraudRatioRow = { day: string; total_scans: number; invalid_ratio_pct: number | null; flagged_ratio_pct: number | null };
  let fraudToday: FraudRatioRow | null = null;
  let fraud7dInvalidPct: number | null = null;
  let fraud7dFlaggedPct: number | null = null;
  try {
    const todayStr = now.toISOString().slice(0, 10);
    const { data: fraudRows } = await supabase
      .from("venue_scan_fraud_ratios")
      .select("day, total_scans, invalid_ratio_pct, flagged_ratio_pct")
      .eq("venue_id", venueId)
      .gte("day", sevenDaysAgo.slice(0, 10));
    const list = (fraudRows ?? []) as FraudRatioRow[];
    fraudToday = list.find((r) => String(r.day).slice(0, 10) === todayStr) ?? null;
    if (list.length > 0) {
      const totalScans = list.reduce((s, r) => s + r.total_scans, 0);
      const { data: events } = await supabase
        .from("verification_events")
        .select("result, flag_reason")
        .eq("venue_id", venueId)
        .gte("occurred_at", sevenDaysAgo);
      const eventsList = events ?? [];
      const invalid7d = eventsList.filter((e) => e.result === "invalid" || e.result === "expired").length;
      const flagged7d = eventsList.filter((e) => e.flag_reason != null).length;
      fraud7dInvalidPct = totalScans > 0 ? Math.round((invalid7d / totalScans) * 1000) / 10 : null;
      fraud7dFlaggedPct = totalScans > 0 ? Math.round((flagged7d / totalScans) * 1000) / 10 : null;
    }
  } catch {
    // view may not exist yet
  }

  type UtilizationRow = { total_members: number; members_with_scan_7d: number; utilization_7d_pct: number | null };
  let utilization: UtilizationRow | null = null;
  try {
    const { data: u } = await supabase
      .from("venue_membership_utilization")
      .select("total_members, members_with_scan_7d, utilization_7d_pct")
      .eq("venue_id", venueId)
      .maybeSingle();
    utilization = u as UtilizationRow | null;
  } catch {
    // view may not exist yet
  }

  type StaffMetricsRow = { staff_user_id: string; total_scans: number; valid_count: number; invalid_count: number; flagged_count: number; invalid_ratio_pct: number | null; flagged_ratio_pct: number | null };
  let staffMetricsRows: StaffMetricsRow[] = [];
  try {
    const { data: staffMetrics } = await supabase
      .from("venue_staff_verification_metrics")
      .select("staff_user_id, total_scans, valid_count, invalid_count, flagged_count, invalid_ratio_pct, flagged_ratio_pct")
      .eq("venue_id", venueId);
    staffMetricsRows = (staffMetrics ?? []) as StaffMetricsRow[];
  } catch {
    // view may not exist yet; fall back to existing staffRows
  }

  type RevenueByTierRow = { tier: string; revenue_cents: number; tx_count: number };
  let revenueByTierRows: RevenueByTierRow[] = [];
  try {
    const { data: revRows } = await supabase
      .from("venue_revenue_by_tier")
      .select("tier, revenue_cents, tx_count")
      .eq("venue_id", venueId);
    revenueByTierRows = (revRows ?? []) as RevenueByTierRow[];
  } catch {
    // view or table may not exist yet
  }

  type HourlyRow = { day: string; hour: number; total_scans: number };
  let hourlyRows: HourlyRow[] = [];
  try {
    const startOfSevenDaysAgo = new Date(now);
    startOfSevenDaysAgo.setUTCDate(startOfSevenDaysAgo.getUTCDate() - 7);
    startOfSevenDaysAgo.setUTCHours(0, 0, 0, 0);
    const { data: hourlyData } = await supabase
      .from("venue_daily_hourly_scans")
      .select("day, hour, total_scans")
      .eq("venue_id", venueId)
      .gte("day", startOfSevenDaysAgo.toISOString().slice(0, 10));
    hourlyRows = (hourlyData ?? []) as HourlyRow[];
  } catch {
    // view may not exist yet
  }

  return (
    <main className="p-6 sm:p-8 max-w-4xl mx-auto">
      <header className="border-b border-slate-200 dark:border-slate-700 pb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          Venue Intelligence
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400 text-sm">
          <strong>{venueName}</strong>
        </p>
        <p className="mt-1 text-slate-500 dark:text-slate-500 text-xs max-w-xl">
          Every scan becomes structured data. Traffic, tier mix, and peak hours — all in real time.
        </p>
      </header>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
          Live today
        </h2>
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4 min-w-0">
          <LiveVerificationCount venueId={venueId} initialCount={todayApproved} label="Today" />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
          Last 24 hours
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4 min-w-0">
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total</div>
            <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-1">
              {total24h !== null ? total24h : "—"}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4 min-w-0">
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Valid</div>
            <div className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-1">
              {valid24h !== null ? valid24h : "—"}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4 min-w-0">
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Invalid</div>
            <div className="text-2xl font-semibold text-red-600 dark:text-red-400 mt-1">
              {invalid24h !== null ? invalid24h : "—"}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4 min-w-0">
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Flagged</div>
            <div className="text-2xl font-semibold text-amber-600 dark:text-amber-400 mt-1">
              {flagged24h !== null ? flagged24h : "—"}
            </div>
          </div>
        </div>
      </section>

      {(fraudToday !== null || fraud7dInvalidPct !== null) && (
        <section className="mt-8">
          <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
            Fraud / invalid scan ratios
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {fraudToday && (
              <>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4 min-w-0">
                  <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Today invalid %</div>
                  <div className="text-2xl font-semibold text-red-600 dark:text-red-400 mt-1">
                    {fraudToday.invalid_ratio_pct != null ? `${fraudToday.invalid_ratio_pct}%` : "—"}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4 min-w-0">
                  <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Today flagged %</div>
                  <div className="text-2xl font-semibold text-amber-600 dark:text-amber-400 mt-1">
                    {fraudToday.flagged_ratio_pct != null ? `${fraudToday.flagged_ratio_pct}%` : "—"}
                  </div>
                </div>
              </>
            )}
            {fraud7dInvalidPct != null && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4 min-w-0">
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">7d invalid %</div>
                <div className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mt-1">{fraud7dInvalidPct}%</div>
              </div>
            )}
            {fraud7dFlaggedPct != null && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4 min-w-0">
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">7d flagged %</div>
                <div className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mt-1">{fraud7dFlaggedPct}%</div>
              </div>
            )}
          </div>
        </section>
      )}

      {utilization !== null && utilization.total_members > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
            Membership utilization (7d)
          </h2>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Members with at least one valid scan</div>
            <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-1">
              {utilization.utilization_7d_pct != null ? `${utilization.utilization_7d_pct}%` : "—"}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-2">
                ({utilization.members_with_scan_7d} / {utilization.total_members} members)
              </span>
            </div>
          </div>
        </section>
      )}

      {tierUsageRows.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
            Tier usage (all time)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            Scan count by membership tier. e.g. &quot;VIP members account for 42% of visits.&quot;
          </p>
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80">
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                    Tier
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                    Scans
                  </th>
                </tr>
              </thead>
              <tbody>
                {tierUsageRows.map(({ tier, total_scans }) => (
                  <tr key={tier} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 capitalize">{tier}</td>
                    <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">{total_scans}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
          Peak hours & heatmap
        </h2>
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/30 p-4">
          <ScanHeatmap data={hourlyRows} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
          Last 7 days (daily)
        </h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80">
                <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  Date
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  Total
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  Valid
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  Invalid
                </th>
              </tr>
            </thead>
            <tbody>
              {dailyRows.length > 0 ? (
                dailyRows.map(({ date, total, valid, invalid }) => (
                  <tr key={date} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{date}</td>
                    <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">{total}</td>
                    <td className="px-4 py-3 text-right text-green-600 dark:text-green-400">{valid}</td>
                    <td className="px-4 py-3 text-right text-red-600 dark:text-red-400">{invalid}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    —
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
          Staff verification metrics
        </h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80">
                <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  Staff
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  Total
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  Invalid
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  Flagged
                </th>
                {staffMetricsRows.length > 0 && staffMetricsRows[0].invalid_ratio_pct != null && (
                  <>
                    <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                      Invalid %
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                      Flagged %
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {staffMetricsRows.length > 0 ? (
                staffMetricsRows.map((row) => (
                  <tr key={row.staff_user_id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {truncateId(row.staff_user_id)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">{row.total_scans}</td>
                    <td className="px-4 py-3 text-right text-red-600 dark:text-red-400">{row.invalid_count}</td>
                    <td className="px-4 py-3 text-right text-amber-600 dark:text-amber-400">{row.flagged_count}</td>
                    {row.invalid_ratio_pct != null && (
                      <>
                        <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">{row.invalid_ratio_pct}%</td>
                        <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">{row.flagged_ratio_pct != null ? `${row.flagged_ratio_pct}%` : "—"}</td>
                      </>
                    )}
                  </tr>
                ))
              ) : staffRows.length > 0 ? (
                staffRows.map(({ staff_user_id, total, invalid, flagged }) => (
                  <tr key={staff_user_id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {truncateId(staff_user_id)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">{total}</td>
                    <td className="px-4 py-3 text-right text-red-600 dark:text-red-400">{invalid}</td>
                    <td className="px-4 py-3 text-right text-amber-600 dark:text-amber-400">{flagged}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    —
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {revenueByTierRows.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
            Revenue attribution by tier
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            Revenue from venue_transactions linked to membership tier.
          </p>
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80">
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                    Tier
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                    Revenue
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                    Transactions
                  </th>
                </tr>
              </thead>
              <tbody>
                {revenueByTierRows.map(({ tier, revenue_cents, tx_count }) => (
                  <tr key={tier} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 capitalize">{tier.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                      ${(revenue_cents / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">{tx_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
