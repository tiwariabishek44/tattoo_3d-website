// Cinematic overlays for the hero canvas: a radial vignette + fine film grain.
// Both are pointer-events:none and sit above the canvas, below the text.
// Grain masks the AI "too-smooth"/banding look; vignette focuses + adds depth.

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function HeroFx() {
  return (
    <>
      {/* vignette — transparent center, darker edges */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      {/* film grain */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: GRAIN,
          backgroundSize: "160px 160px",
          opacity: 0.09,
          mixBlendMode: "overlay",
        }}
      />
    </>
  );
}
