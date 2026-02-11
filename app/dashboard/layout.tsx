import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { VenueSwitcher } from "@/components/dashboard/VenueSwitcher";

export const dynamic = "force-dynamic";
import { CURRENT_VENUE_COOKIE } from "@/lib/constants";
import { allowedVenuesForUser, getRoleForUser, isDashboardAdmin } from "@/lib/dashboard-auth";
import { createServerSupabase } from "@/lib/supabase-server";
import { onlyPilotVenues, withDisplayNames, venueDisplayName } from "@/lib/venues";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createServerSupabase(cookieStore, true);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/");
  }

  const isAdmin = isDashboardAdmin(user);

  const { data: memberships } = await supabase
    .from("memberships")
    .select("venue_id, venues(id, name, slug, is_demo)")
    .eq("user_id", user.id);
  const { data: staffVenues } = await supabase
    .from("venue_staff")
    .select("venue_id, venues(id, name, slug, is_demo)")
    .eq("user_id", user.id);

  type V = { id: string; name: string; slug: string; is_demo?: boolean };
  const fromMemberships = (memberships ?? [])
    .map((m) => (m as unknown as { venues: V | null }).venues)
    .filter((v): v is V => v != null && (!v.is_demo || isAdmin));
  const fromStaff = (staffVenues ?? [])
    .map((s) => (s as unknown as { venues: V | null }).venues)
    .filter((v): v is V => v != null && (!v.is_demo || isAdmin));

  const allowedOptions = allowedVenuesForUser({
    isAdmin,
    fromMemberships: fromMemberships.map((v) => ({ id: v.id, slug: v.slug, name: v.name })),
    fromStaff: fromStaff.map((v) => ({ id: v.id, slug: v.slug, name: v.name })),
  });
  const allVenues = withDisplayNames(allowedOptions.map((v) => ({ slug: v.slug, name: v.name })));
  const venues = onlyPilotVenues(allVenues);

  const rawSlug = cookieStore.get(CURRENT_VENUE_COOKIE)?.value ?? null;
  const currentSlug = rawSlug?.trim() || null;
  let currentVenue = currentSlug ? venues.find((v) => v.slug === currentSlug) : venues[0] ?? null;
  if (currentSlug && !currentVenue && venues.length > 0) {
    const allowedBySlug = allowedOptions.find((o) => o.slug === currentSlug);
    if (allowedBySlug) {
      currentVenue = withDisplayNames([{ slug: allowedBySlug.slug, name: allowedBySlug.name }])[0];
    } else {
      redirect(`/api/set-venue?venue=${encodeURIComponent(venues[0].slug)}&next=/dashboard`);
    }
  }
  if (!currentSlug && venues.length > 0) {
    redirect(`/api/set-venue?venue=${encodeURIComponent(venues[0].slug)}&next=/dashboard`);
  }
  if (!currentVenue && venues.length > 0) {
    currentVenue = venues[0];
  }
  const displayName =
    currentVenue?.name ??
    (currentSlug ? venueDisplayName(currentSlug, "Venue") : "Venue");
  // Use resolved venue slug, or cookie slug when venue list didn't resolve (e.g. so background still applies)
  const effectiveSlug = currentVenue?.slug ?? currentSlug ?? null;
  const isFunctionSF = effectiveSlug === "the-function-sf";
  const isStarryPlough = effectiveSlug === "the-starry-plough";

  const hasStaffRows = (staffVenues?.length ?? 0) > 0;
  const role = getRoleForUser(user, hasStaffRows);

  return (
    <div
      className={`venue-theme min-h-screen flex flex-col md:flex-row ${isFunctionSF ? "venue-blurred-stage" : ""} ${isStarryPlough ? "venue-theme-starry-plough venue-blurred-pub" : ""}`}
      style={{ color: "var(--venue-text)", ...(isFunctionSF || isStarryPlough ? {} : { backgroundColor: "var(--venue-bg)" }) }}
    >
      <header
        className="flex-shrink-0 border-b md:border-b-0 md:border-r border-white/10"
        style={{ backgroundColor: "var(--venue-sidebar-bg)" }}
      >
        <div className="flex flex-row md:flex-col items-center md:items-stretch gap-4 p-4 md:p-5 md:min-w-[200px]">
          <Link
            href="/"
            className="flex flex-col md:flex-none focus:outline-none focus:ring-2 focus:ring-[var(--venue-accent)] focus:ring-offset-2 focus:ring-offset-[var(--venue-bg)] rounded"
          >
            <span className="font-semibold tracking-tight text-lg" style={{ color: "var(--venue-text)" }}>
              COTERI
            </span>
            <span className="text-xs mt-0.5" style={{ color: "var(--venue-text-muted)" }}>
              × {displayName}
            </span>
          </Link>
          <p className="text-xs font-medium" style={{ color: "var(--venue-text-muted)" }} aria-label="Your role">
            {role === "admin" && "Logged in as Admin"}
            {role === "venue_owner" && "Logged in as Venue owner"}
            {role === "member" && "Logged in as Member"}
          </p>
          <VenueSwitcher venues={venues} currentSlug={currentVenue?.slug ?? null} />
          <div className="hidden md:block h-px my-1 opacity-20" style={{ backgroundColor: "var(--venue-accent)" }} aria-hidden />
          <nav className="flex md:flex-col gap-1 ml-auto md:ml-0 text-sm">
            <Link
              href="/"
              className="px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[var(--venue-accent)] hover:bg-white/5"
              style={{ color: "var(--venue-text-muted)" }}
            >
              ← Back to COTERI
            </Link>
            <Link
              href="/dashboard"
              className="px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[var(--venue-accent)] hover:bg-white/5"
              style={{ color: "var(--venue-text)" }}
            >
              Dashboard
            </Link>
            <Link
              href={effectiveSlug ? `/membership?venue=${encodeURIComponent(effectiveSlug)}` : "/membership"}
              className="px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[var(--venue-accent)] hover:bg-white/5"
              style={{ color: "var(--venue-text-muted)" }}
            >
              Pass & QR
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[var(--venue-accent)] hover:bg-white/5"
                style={{ color: "var(--venue-text-muted)" }}
              >
                Admin
              </Link>
            )}
            <form action="/auth/logout" method="post" className="inline mt-2">
              <button
                type="submit"
                className="text-left w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--venue-accent)]"
                style={{ color: "var(--venue-text-muted)" }}
              >
                Log out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
