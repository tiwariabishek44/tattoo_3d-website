"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Client-side mobile routing (replaces the old edge middleware, which failed to
// invoke on Vercel). Mobile user-agents on "/" are sent to the worker-rendered
// "/mobile". Runs after mount, so it never blocks the page from loading.
const MOBILE_UA =
  /Android|iPhone|iPod|Windows Phone|BlackBerry|Opera Mini|IEMobile|Mobile/i;

export default function MobileRedirect() {
  const router = useRouter();
  useEffect(() => {
    if (typeof navigator !== "undefined" && MOBILE_UA.test(navigator.userAgent)) {
      router.replace("/mobile");
    }
  }, [router]);
  return null;
}
