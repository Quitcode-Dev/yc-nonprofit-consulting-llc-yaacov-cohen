"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabaseRef = useRef(createClient());
  const isExpiringRef = useRef(false);

  useEffect(() => {
    const supabase = supabaseRef.current;

    const resetTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(async () => {
        isExpiringRef.current = true;
        await supabase.auth.signOut();
        router.push("/login?expired=true");
      }, INACTIVITY_TIMEOUT);
    };

    const activityEvents = ["mousemove", "keydown", "click", "scroll"] as const;

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Start the timer on mount
    resetTimer();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" && !isExpiringRef.current) {
        router.push("/login");
      }
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      subscription.unsubscribe();
    };
  }, [router]);

  return <>{children}</>;
}
