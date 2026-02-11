import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CURRENT_VENUE_COOKIE, getFallbackVenues, isDemoMode } from "@/lib/constants";
import { isDashboardAdmin } from "@/lib/dashboard-auth";
import { createServerSupabase } from "@/lib/supabase-server";
import { VenueBannerGrid } from "./venue-banner-grid";

export default async function InternalDemoPage() {
  if (!isDemoMode()) {
    redirect("/");
  }

  const cookieStore = await cookies();
  const supabase = createServerSupabase(cookieStore, true);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div className="p-6 sm:p-8 md:p-10 max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          COTERI
        </h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          Sign in to choose a venue and view your dashboard.
        </p>
        <p className="mt-6">
          <Link
            href="/sign-in?next=/dashboard"
            className="inline-block rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/50 px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Sign in →
          </Link>
        </p>
      </div>
    );
  }

  const canManageAccess = isDashboardAdmin(user);

  const currentVenueSlug = cookieStore.get(CURRENT_VENUE_COOKIE)?.value ?? null;
  const VENUE_BANNER_IMAGES: Record<string, string> = {
    "the-function-sf": "/venues/3.png",
    "the-starry-plough":
      "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800&q=80",
    "la-rueda":
      "https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=800&q=80",
    "strike-zone":
      "https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=800&q=80",
    "pacific-greens":
      "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80",
  };
  const fallbackVenues = getFallbackVenues();
  const venueListWithBanners = fallbackVenues.map((v) => ({
    name: v.name,
    slug: v.slug,
    bannerImage: VENUE_BANNER_IMAGES[v.slug] ?? "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80",
  }));
  const currentVenue =
    currentVenueSlug != null
      ? venueListWithBanners.find((v) => v.slug === currentVenueSlug) ?? null
      : null;

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  type VenueOption = { name: string; slug: string; membershipId: string | null; venueId: string | null; appleUrl: string | null; googleUrl: string | null };
  const venueOptions: VenueOption[] = await Promise.all(
    fallbackVenues.map(async (v) => {
      const { data: venueRow } = await supabase.from("venues").select("id").eq("slug", v.slug).maybeSingle();
      const venueId = venueRow?.id ?? null;
      let membershipId: string | null = null;
      if (venueId) {
        const { data: m } = await supabase
          .from("memberships")
          .select("id")
          .eq("venue_id", venueId)
          .eq("user_id", user.id)
          .eq("status", "active")
          .maybeSingle();
        membershipId = m?.id ?? null;
      }
      const appleUrl =
        membershipId && venueId
          ? `${base}/api/wallet/apple?membership_id=${encodeURIComponent(membershipId)}&venue_id=${encodeURIComponent(venueId)}`
          : null;
      const googleUrl =
        membershipId && venueId
          ? `${base}/api/wallet/google?membership_id=${encodeURIComponent(membershipId)}&venue_id=${encodeURIComponent(venueId)}`
          : null;
      return { name: v.name, slug: v.slug, membershipId, venueId, appleUrl, googleUrl };
    })
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 sm:p-8 md:p-10">
      <div className="w-full max-w-4xl mx-auto text-center flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          COTERI
        </h1>
        <p className="mt-6 text-slate-600 dark:text-slate-400 text-sm">
          Choose a venue to open its dashboard.
        </p>
        <div className="mt-10 w-full max-w-5xl">
          <VenueBannerGrid venues={venueListWithBanners} currentVenue={currentVenue} />
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto mt-16 pt-10 border-t border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap justify-center items-stretch gap-8 sm:gap-10">
          {canManageAccess && (
            <section className="flex-1 min-w-[200px] max-w-[280px] text-center">
              <h2 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                Admin
              </h2>
              <Link
                href="/admin"
                className="inline-block rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/80 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Manage access, grant membership, demo reset
              </Link>
            </section>
          )}
          {venueOptions.map((vo) => (
            <section key={vo.slug} className="flex-1 min-w-[200px] max-w-[280px] text-center">
              <h2 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                Wallet passes — {vo.name}
              </h2>
              <ul className="space-y-2">
                {vo.appleUrl ? (
                  <li>
                    <a
                      href={vo.appleUrl}
                      className="inline-flex items-center justify-center w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Apple Wallet (.pkpass)
                    </a>
                  </li>
                ) : (
                  <li className="text-slate-500 dark:text-slate-400 text-sm">
                    No membership at {vo.name} yet.
                  </li>
                )}
                {vo.googleUrl ? (
                  <li>
                    <a
                      href={vo.googleUrl}
                      className="inline-flex items-center justify-center w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Google Wallet (Save link)
                    </a>
                  </li>
                ) : null}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
