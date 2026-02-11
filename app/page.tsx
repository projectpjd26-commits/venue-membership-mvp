import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerSupabase } from "@/lib/supabase-server";
import { PreviewCard } from "@/components/PreviewCard";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const cookieStore = await cookies();
  const supabase = createServerSupabase(cookieStore, true);
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/launch");
  }

  return (
    <>
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Membership Infrastructure for Physical Venues
            </h1>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-xl">
              Payments, verification, and member access — unified.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/demo"
                className="inline-flex items-center justify-center rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 font-medium hover:bg-slate-800 dark:hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                Open Demo Venue
              </Link>
              <Link
                href="/venues"
                className="inline-flex items-center justify-center rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 px-5 py-3 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              >
                For Venues
              </Link>
            </div>
          </div>
          <div className="opacity-95 transition-opacity duration-300">
            <PreviewCard />
          </div>
        </div>
      </section>

      <section className="w-full bg-slate-50 dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 text-slate-400 dark:text-slate-500" aria-hidden>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </span>
              <span className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Secure Payments (Stripe-powered)
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 text-slate-400 dark:text-slate-500" aria-hidden>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <span className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Real-time Verification
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 text-slate-400 dark:text-slate-500" aria-hidden>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </span>
              <span className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Venue-Level Analytics
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white text-center mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          <div className="flex flex-col items-center text-center">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm">
              1
            </span>
            <p className="mt-4 font-medium text-slate-900 dark:text-white">Member Purchases</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Member buys or renews at the venue.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm">
              2
            </span>
            <p className="mt-4 font-medium text-slate-900 dark:text-white">Access Verified</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Staff verifies at the door or device.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm">
              3
            </span>
            <p className="mt-4 font-medium text-slate-900 dark:text-white">Venue Gains Insight</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Usage and analytics in one place.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>© COTERI</span>
          <Link href="/sign-in" className="hover:text-slate-700 dark:hover:text-slate-300">
            Sign in
          </Link>
        </div>
      </footer>
    </>
  );
}
