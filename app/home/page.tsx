import { Suspense } from "react";
import { HomeHeroContent } from "@/components/home/HomeHeroContent";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center p-10 text-slate-500">Loading…</div>}>
      <HomeHeroContent />
    </Suspense>
  );
}
