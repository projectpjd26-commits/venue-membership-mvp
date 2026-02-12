import Link from "next/link";
import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/constants";

export const dynamic = "force-dynamic";

/**
 * Public demo entry. When demo mode is on, go to internal demo; else show a page so the button does something.
 */
export default function DemoPage() {
  if (isDemoMode()) {
    redirect("/internal/demo");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-24 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Demo
        </h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          Demo mode is not enabled on this deployment. Sign in to open the venue launcher and try the app.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/sign-in?next=/launch"
            className="inline-flex items-center justify-center rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 font-medium hover:bg-slate-800 dark:hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Sign in
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 px-5 py-3 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            Back
          </Link>
        </div>
      </div>
    </main>
  );
}
