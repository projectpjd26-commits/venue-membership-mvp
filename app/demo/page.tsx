import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/constants";

export const dynamic = "force-dynamic";

/**
 * Public demo entry. When demo mode is on, show internal demo; else redirect to splash.
 */
export default function DemoPage() {
  if (isDemoMode()) {
    redirect("/internal/demo");
  }
  redirect("/");
}
