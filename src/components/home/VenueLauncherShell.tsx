import Link from "next/link";
import { HomeVenueChooser } from "@/components/home/HomeVenueChooser";

type Venue = { slug: string; name: string };

export function VenueLauncherShell({
  venues,
  currentSlug,
  children,
  homeHref = "/",
}: {
  venues: Venue[];
  currentSlug: string | null;
  children: React.ReactNode;
  /** Link for "COTERI" / Home - use "/" for root, "/home" for home route */
  homeHref?: string;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <aside className="flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 md:min-w-[220px]">
        <div className="flex flex-row md:flex-col items-center md:items-stretch gap-4 p-4 md:p-5">
          <Link
            href={homeHref}
            className="flex flex-col md:flex-none focus:outline-none focus:ring-2 focus:ring-slate-400 rounded"
          >
            <span className="text-xl font-semibold tracking-tight">COTERI</span>
            <span className="text-xs mt-0.5 text-slate-500 dark:text-slate-400">
              Home
            </span>
          </Link>
          <HomeVenueChooser venues={venues} currentSlug={currentSlug} />
          <div className="hidden md:block h-px my-1 bg-slate-200 dark:bg-slate-700" aria-hidden />
          <div className="ml-auto md:ml-0">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              Sign in
            </Link>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
