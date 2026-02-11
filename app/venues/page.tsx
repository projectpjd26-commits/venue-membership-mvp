import Link from "next/link";

export const metadata = {
  title: "For Venues — COTERI",
  description: "Membership infrastructure for physical venues.",
};

export default function VenuesPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-24 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-xl mx-auto text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          For Venues
        </h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          Payments, verification, and member access — unified for your venue.
        </p>
        <p className="mt-8">
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 font-medium hover:bg-slate-800 dark:hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Sign in
          </Link>
        </p>
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:underline">← Back</Link>
        </p>
      </div>
    </main>
  );
}
