import SpiderSequence from "@/components/SpiderSequence";
import BookButton from "@/components/BookButton";

// Design 2 — minimal showcase: the spider story IS the page.
export default function Design2() {
  return (
    <main style={{ background: "#070605" }}>
      {/* subtle back link, top-left */}
      <a
        href="/"
        style={{
          position: "fixed",
          top: "clamp(18px, 3vw, 30px)",
          left: "clamp(20px, 3vw, 40px)",
          zIndex: 60,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          textTransform: "uppercase",
          letterSpacing: "0.22em",
          fontSize: "0.72rem",
          fontWeight: 600,
          color: "rgba(242,239,233,0.82)",
          textDecoration: "none",
        }}
      >
        <span aria-hidden style={{ fontSize: "0.95rem" }}>←</span>
        Teyung
      </a>

      <SpiderSequence />
      <BookButton />
    </main>
  );
}
