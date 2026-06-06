"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Client-side mobile routing (replaces the old edge middleware, which failed to
// invoke on Vercel). When enabled, mobile user-agents on "/" are sent to the
// worker-rendered "/mobile". Runs after mount, so it never blocks page load.
//
// PAUSED for now: every device gets the desktop view. Flip ENABLED back to true
// to restore the /mobile redirect (no code was removed).
const ENABLED = false;
const MOBILE_UA =
  /Android|iPhone|iPod|Windows Phone|BlackBerry|Opera Mini|IEMobile|Mobile/i;

export default function MobileRedirect() {
  const router = useRouter();
  useEffect(() => {
    if (!ENABLED) return;
    if (typeof navigator !== "undefined" && MOBILE_UA.test(navigator.userAgent)) {
      router.replace("/mobile");
    }
  }, [router]);
  return null;
}
