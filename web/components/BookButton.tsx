import { SANS, COLORS } from "@/lib/theme";

// Persistent CTA — fixed, visible through the whole scroll.
export default function BookButton() {
  return (
    <a
      href="#book"
      style={{
        position: "fixed",
        bottom: "clamp(44px, 7vh, 80px)",
        right: "clamp(20px, 3vw, 40px)",
        zIndex: 60,
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontFamily: SANS,
        textTransform: "uppercase",
        letterSpacing: "0.18em",
        fontSize: "0.78rem",
        fontWeight: 600,
        color: COLORS.ink,
        background: COLORS.gold,
        padding: "1rem 1.8rem",
        borderRadius: 999,
        textDecoration: "none",
        boxShadow: "0 10px 34px rgba(0,0,0,0.45)",
      }}
    >
      Book a session
      <span aria-hidden style={{ fontSize: "0.9rem" }}>↗</span>
    </a>
  );
}
