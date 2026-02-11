import { cookies } from "next/headers";
import { VenueLauncherShell } from "@/components/home/VenueLauncherShell";
import { getHomeVenueData } from "@/lib/home-venues";

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const { venues, currentSlug } = await getHomeVenueData(cookieStore);

  return (
    <VenueLauncherShell venues={venues} currentSlug={currentSlug} homeHref="/home">
      {children}
    </VenueLauncherShell>
  );
}
