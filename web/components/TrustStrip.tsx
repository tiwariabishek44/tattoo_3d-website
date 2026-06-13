// Phase 0.3 (roadmap M2) — the trust strip. Four quiet facts that answer a
// tourist's real questions (where, language, hygiene, availability) right
// where the booking decision happens. Premium chrome whispers: small caps,
// muted, separated by gold interpuncts — never a badge wall.

import { SANS, COLORS, TRUST_POINTS, withAlpha } from "@/lib/theme";

export default function TrustStrip({
  style,
}: {
  style?: React.CSSProperties;
}) {
  return (
    <p
      style={{
        fontFamily: SANS,
        fontSize: "0.72rem",
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.18em",
        color: withAlpha(COLORS.offWhite, 0.55),
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: "0.9em",
        margin: 0,
        ...style,
      }}
    >
      {TRUST_POINTS.map((point, i) => (
        <span key={point} style={{ display: "inline-flex", alignItems: "center", gap: "0.9em" }}>
          {i > 0 && (
            <span aria-hidden style={{ color: COLORS.gold, fontSize: "0.6rem" }}>
              ·
            </span>
          )}
          {point}
        </span>
      ))}
    </p>
  );
}
