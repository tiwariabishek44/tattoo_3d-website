"use client";

// Phase 0.3 (roadmap M2) — the booking path. The page the whole site exists
// to reach: a 30-second form plus the two channels a tourist mid-trip
// actually uses (WhatsApp / Instagram). Editorial two-column: the promise and
// trust on the left, the form on the right.
//
// [LINK-SWAP LATER]: the interim form action builds a structured email draft
// via mailto (honest placeholder — it really works). When the studio's real
// booking backend arrives, replace buildBookingAction() below + the registry
// values in lib/theme.ts. Nothing else moves.

import { useState } from "react";
import { motion } from "framer-motion";
import Reveal from "./Reveal";
import TrustStrip from "./TrustStrip";
import {
  SERIF,
  SANS,
  COLORS,
  eyebrow,
  GUTTER,
  withAlpha,
  TYPE,
  BOOKING_EMAIL,
  WHATSAPP_HREF,
  INSTAGRAM_HREF,
} from "@/lib/theme";
import { EASE_MECHANICAL } from "@/lib/motionTokens";

const STYLES = [
  "Not sure yet",
  "Realism",
  "Traditional",
  "Blackwork",
  "Cover-up",
  "Piercing",
];

type BookingData = {
  name: string;
  email: string;
  dates: string;
  style: string;
  placement: string;
  idea: string;
};

// [LINK-SWAP LATER] — the ONE function to replace with the real form action.
function buildBookingAction(d: BookingData): string {
  const subject = `Booking enquiry — ${d.name || "Teyung Tattook Ink"}`;
  const body = [
    `Name: ${d.name}`,
    `Email: ${d.email}`,
    `In Kathmandu: ${d.dates}`,
    `Style: ${d.style}`,
    `Placement & size: ${d.placement}`,
    "",
    "The idea:",
    d.idea,
    "",
    "(Reference photos attached)",
  ].join("\n");
  return `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

const inputBase: React.CSSProperties = {
  fontFamily: SANS,
  fontSize: "1rem",
  fontWeight: 400,
  color: COLORS.offWhite,
  background: withAlpha(COLORS.offWhite, 0.04),
  border: `1px solid ${withAlpha(COLORS.offWhite, 0.16)}`,
  borderRadius: 2,
  padding: "0.85rem 1rem",
  width: "100%",
  outline: "none",
  transition: "border-color 0.25s ease",
};

const labelStyle: React.CSSProperties = {
  fontFamily: SANS,
  fontSize: "0.7rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  color: withAlpha(COLORS.offWhite, 0.6),
  display: "block",
  marginBottom: "0.55rem",
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

const focusGold = {
  onFocus: (e: React.FocusEvent<HTMLElement>) => {
    (e.currentTarget as HTMLElement).style.borderColor = COLORS.gold;
  },
  onBlur: (e: React.FocusEvent<HTMLElement>) => {
    (e.currentTarget as HTMLElement).style.borderColor = withAlpha(
      COLORS.offWhite,
      0.16,
    );
  },
};

// Channel button — WhatsApp / Instagram. Operated UI: 250ms, EASE_MECHANICAL.
function ChannelButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{
        scale: 1.02,
        borderColor: COLORS.gold,
        color: COLORS.gold,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "tween", duration: 0.25, ease: EASE_MECHANICAL }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        fontFamily: SANS,
        textTransform: "uppercase",
        letterSpacing: "0.16em",
        fontSize: "0.78rem",
        fontWeight: 600,
        color: COLORS.offWhite,
        border: `1px solid ${withAlpha(COLORS.offWhite, 0.28)}`,
        background: "transparent",
        padding: "1rem 1.6rem",
        borderRadius: 2,
        textDecoration: "none",
        flex: "1 1 0",
      }}
    >
      {children}
      <span aria-hidden style={{ fontSize: "0.9rem" }}>↗</span>
    </motion.a>
  );
}

export default function BookingForm() {
  const [data, setData] = useState<BookingData>({
    name: "",
    email: "",
    dates: "",
    style: STYLES[0],
    placement: "",
    idea: "",
  });
  const [sent, setSent] = useState(false);

  const set =
    (key: keyof BookingData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setData((d) => ({ ...d, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = buildBookingAction(data);
    setSent(true);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: COLORS.ink,
        padding: `clamp(32px, 5vh, 64px) ${GUTTER} clamp(80px, 12vh, 160px)`,
      }}
    >
      {/* back to the story */}
      <a
        href="/"
        style={{
          fontFamily: SANS,
          fontSize: "0.75rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: withAlpha(COLORS.offWhite, 0.55),
          textDecoration: "none",
        }}
      >
        ← Teyung Tattook Ink
      </a>

      <div
        style={{
          maxWidth: 1200,
          margin: "clamp(48px, 8vh, 96px) auto 0",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          gap: "clamp(48px, 6vw, 96px)",
          alignItems: "start",
        }}
      >
        {/* ── Left: the promise, the trust, the fast channels ── */}
        <div>
          <Reveal variant="rule">
            <div style={{ ...eyebrow(), marginBottom: "1.4rem" }}>
              Book a session
            </div>
          </Reveal>
          <Reveal delay={0.08} variant="heading">
            <h1
              style={{
                fontFamily: SERIF,
                fontWeight: 500,
                ...TYPE.h2,
                color: COLORS.offWhite,
                margin: 0,
              }}
            >
              Your mark begins with a conversation.
            </h1>
          </Reveal>
          <Reveal delay={0.16} variant="body">
            <p
              style={{
                fontFamily: SANS,
                fontSize: "1.05rem",
                lineHeight: 1.7,
                color: COLORS.muted,
                margin: "1.8rem 0 0",
                maxWidth: "44ch",
              }}
            >
              Tell us your idea and your dates — we reply within a day. In
              Kathmandu already? Walk-ins are welcome when the chair is free.
            </p>
          </Reveal>

          <Reveal delay={0.22} variant="body">
            <TrustStrip
              style={{ justifyContent: "flex-start", margin: "2rem 0 0" }}
            />
          </Reveal>

          {/* fastest channels — what a tourist actually uses */}
          <Reveal delay={0.3} variant="body">
            <div style={{ marginTop: "2.6rem" }}>
              <span style={labelStyle}>Fastest reply</span>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <ChannelButton href={WHATSAPP_HREF}>WhatsApp</ChannelButton>
                <ChannelButton href={INSTAGRAM_HREF}>Instagram</ChannelButton>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ── Right: the 30-second form ── */}
        <Reveal delay={0.18} variant="body">
          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gap: "1.6rem",
              padding: "clamp(28px, 3vw, 44px)",
              background: withAlpha(COLORS.offWhite, 0.03),
              border: `1px solid ${withAlpha(COLORS.offWhite, 0.1)}`,
              borderRadius: 2,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.4rem",
              }}
            >
              <Field label="Name">
                <input
                  required
                  value={data.name}
                  onChange={set("name")}
                  style={inputBase}
                  {...focusGold}
                  placeholder="Your name"
                />
              </Field>
              <Field label="Email">
                <input
                  required
                  type="email"
                  value={data.email}
                  onChange={set("email")}
                  style={inputBase}
                  {...focusGold}
                  placeholder="you@example.com"
                />
              </Field>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.4rem",
              }}
            >
              <Field label="When are you in Kathmandu?">
                <input
                  required
                  value={data.dates}
                  onChange={set("dates")}
                  style={inputBase}
                  {...focusGold}
                  placeholder="e.g. 14–21 June"
                />
              </Field>
              <Field label="Style">
                <select
                  value={data.style}
                  onChange={set("style")}
                  style={{ ...inputBase, appearance: "none", cursor: "pointer" }}
                  {...focusGold}
                >
                  {STYLES.map((s) => (
                    <option key={s} value={s} style={{ color: COLORS.inkText }}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Placement & size">
              <input
                value={data.placement}
                onChange={set("placement")}
                style={inputBase}
                {...focusGold}
                placeholder="e.g. forearm, ~15cm"
              />
            </Field>

            <Field label="The idea">
              <textarea
                required
                value={data.idea}
                onChange={set("idea")}
                rows={5}
                style={{ ...inputBase, resize: "vertical" }}
                {...focusGold}
                placeholder="What do you want to carry with you?"
              />
            </Field>

            <motion.button
              type="submit"
              whileHover={{
                scale: 1.02,
                boxShadow: `0 16px 50px ${withAlpha(COLORS.gold, 0.35)}`,
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "tween", duration: 0.25, ease: EASE_MECHANICAL }}
              style={{
                fontFamily: SANS,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: COLORS.ink,
                background: COLORS.gold,
                padding: "1.1rem 2.6rem",
                border: "none",
                borderRadius: 2,
                cursor: "pointer",
                justifySelf: "start",
              }}
            >
              Send enquiry
            </motion.button>

            <p
              style={{
                fontFamily: SANS,
                fontSize: "0.82rem",
                lineHeight: 1.6,
                color: sent
                  ? COLORS.gold
                  : withAlpha(COLORS.offWhite, 0.45),
                margin: 0,
                transition: "color 0.3s ease",
              }}
            >
              {sent
                ? "Your email draft is ready — attach any reference photos before sending. We reply within a day."
                : "Opens a pre-filled email — attach reference photos there, or send them over WhatsApp."}
            </p>
          </form>
        </Reveal>
      </div>
    </main>
  );
}
