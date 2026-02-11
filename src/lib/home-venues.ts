import { CURRENT_VENUE_COOKIE, getFallbackVenues } from "@/lib/constants";
import { createServerSupabase } from "@/lib/supabase-server";
import { onlyPilotVenues, withDisplayNames } from "@/lib/venues";

export type VenueItem = { slug: string; name: string };

type CookieStore = Parameters<typeof createServerSupabase>[0];

export async function getHomeVenueData(cookieStore: CookieStore): Promise<{
  venues: VenueItem[];
  currentSlug: string | null;
}> {
  const all = cookieStore.getAll();
  const currentSlug =
    all.find((c) => c.name === CURRENT_VENUE_COOKIE)?.value ?? null;
  let venues = getFallbackVenues();
  try {
    const supabase = createServerSupabase(cookieStore, true);
    const { data: venueRows } = await supabase
      .from("venues")
      .select("name, slug")
      .order("name");
    if (venueRows && venueRows.length > 0) {
      const list = venueRows
        .map((r) => ({ name: String(r?.name ?? ""), slug: String(r?.slug ?? "").trim() }))
        .filter((v) => v.slug);
      const normalized = withDisplayNames(list);
      const filtered = onlyPilotVenues(normalized);
      if (filtered.length > 0) venues = filtered;
    }
  } catch {
    // use getFallbackVenues() if env missing, DB or RLS fails (e.g. anon on home)
  }
  return { venues, currentSlug };
}
