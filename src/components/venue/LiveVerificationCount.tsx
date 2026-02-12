"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Shows "Today: N verifications" and subscribes to verification_events INSERT
 * for the venue so the count updates in real time (demo wow moment).
 */
export function LiveVerificationCount({
  venueId,
  initialCount,
  label = "Today",
}: {
  venueId: string;
  initialCount: number;
  label?: string;
}) {
  const [count, setCount] = useState(initialCount);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setCount(initialCount), 0);
    return () => clearTimeout(id);
  }, [initialCount, venueId]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("verification_events_live")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "verification_events",
          filter: `venue_id=eq.${venueId}`,
        },
        (payload) => {
          const row = payload.new as { result?: string };
          if (row?.result === "valid") {
            setCount((n) => n + 1);
            setLive(true);
            setTimeout(() => setLive(false), 2000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [venueId]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        {count}
      </span>
      {live && (
        <span
          className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400 animate-pulse"
          aria-live="polite"
        >
          Live
        </span>
      )}
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {label} verifications
      </span>
    </div>
  );
}
