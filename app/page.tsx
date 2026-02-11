import { redirect } from "next/navigation";

/**
 * Root route: redirect to sign-in so production always has a valid `/`.
 * The marketing home lives at (home)/page.tsx; this guarantees `/` is in the build.
 */
export default function RootPage() {
  redirect("/sign-in");
}
