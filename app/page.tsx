import { Suspense } from "react";
import { cookies } from "next/headers";
import { VenueLauncherShell } from "@/components/home/VenueLauncherShell";
import { HomeHeroContent } from "@/components/home/HomeHeroContent";
import { getHomeVenueData } from "@/lib/home-venues";

/**
 * Root route: venue launcher (home with venue chooser). Rendered here to avoid
 * redirect and prevent 404 on edge/static.
 */
export default async function RootPage() {
  const cookieStore = await cookies();
  const { venues, currentSlug } = await getHomeVenueData(cookieStore);

  return (
    <VenueLauncherShell venues={venues} currentSlug={currentSlug} homeHref="/">
      <Suspense fallback={<div className="flex-1 flex items-center justify-center p-10 text-slate-500">Loading…</div>}>
        <HomeHeroContent />
      </Suspense>
    </VenueLauncherShell>
  );
}
