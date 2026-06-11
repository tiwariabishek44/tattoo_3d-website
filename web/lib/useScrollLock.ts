"use client";

import { useEffect } from "react";

// D-16 — shared lightbox/modal scroll lock (previously copy-pasted across
// GalleryPinterest, ArtistShowcaseSlider, Testimonials). Locks body scroll
// while `locked` is true, restores on unlock/unmount. Pair with
// `scrollbar-gutter: stable` in globals.css so locking never shifts layout.
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    document.body.style.overflow = "hidden";
    const lenis = (window as any).lenis;
    if (lenis) {
      lenis.stop();
    }
    return () => {
      document.body.style.overflow = "";
      if (lenis) {
        lenis.start();
      }
    };
  }, [locked]);
}
