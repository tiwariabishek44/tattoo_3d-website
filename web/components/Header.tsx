"use client";

import { useEffect, useRef, useState } from "react";

const SANS = "var(--font-inter), system-ui, sans-serif";
const NAV: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "#" },
  { label: "Artists", href: "#" },
  { label: "After Care", href: "#" },
  { label: "Gallery", href: "#" },
  { label: "Design 2", href: "/design-2" },
  { label: "Concept 3", href: "/concept-3" },
  { label: "Contact", href: "#" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [overImage, setOverImage] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (y <= 0) {
        setHidden(false); // always shown at the very top
      } else {
        const diff = y - lastY.current;
        if (Math.abs(diff) > 2) setHidden(diff > 0); // scroll down → hide, up → show
      }
      lastY.current = y;
      // go transparent over any full-bleed section that opts in (e.g. the
      // service slider) while it occupies the top of the viewport.
      let over = false;
      document.querySelectorAll("[data-transparent-header]").forEach((el) => {
        const r = (el as HTMLElement).getBoundingClientRect();
        if (r.top <= 64 && r.bottom > 64) over = true;
      });
      setOverImage(over);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // frosted bar only when scrolled AND not over a transparent-header section.
  const frosted = scrolled && !overImage;

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "clamp(20px, 3vw, 48px)",
        padding: scrolled
          ? "12px clamp(24px, 4vw, 64px)"
          : "clamp(16px, 2vw, 26px) clamp(24px, 4vw, 64px)",
        fontFamily: SANS,
        // transparent at the top / over a transparent-header section → frosted on scroll
        background: frosted
          ? "rgba(7,6,5,0.82)"
          : "linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0))",
        backdropFilter: frosted ? "blur(14px)" : "none",
        WebkitBackdropFilter: frosted ? "blur(14px)" : "none",
        borderBottom: frosted
          ? "1px solid rgba(203,164,90,0.16)"
          : "1px solid transparent",
        // stay shown over a transparent-header section (don't auto-hide there)
        transform: hidden && !overImage ? "translateY(-100%)" : "translateY(0)",
        transition:
          "transform 0.35s ease, background 0.35s ease, backdrop-filter 0.35s ease, padding 0.35s ease, border-color 0.35s ease",
        pointerEvents: "none",
      }}
    >
      {/* logo — top left */}
      <a
        href="/"
        style={{ pointerEvents: "auto", display: "flex", alignItems: "center" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.webp"
          alt="Teyung Tattoo Ink"
          style={{
            height: scrolled
              ? "clamp(64px, 6vw, 92px)"
              : "clamp(82px, 8vw, 128px)",
            width: "auto",
            display: "block",
            borderRadius: "50%",
            transition: "height 0.35s ease",
          }}
        />
      </a>

      {/* nav — right aligned */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: "clamp(22px, 2.6vw, 46px)",
          pointerEvents: "auto",
        }}
      >
        {NAV.map((item) => (
          <a key={item.label} href={item.href} className="nav-link">
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
