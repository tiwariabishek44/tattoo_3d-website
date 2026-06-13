// Phase 0.3 (roadmap M2) — the booking route every CTA on the site lands on.
// Server shell: metadata here, all interaction in <BookingForm/>.
// [LINK-SWAP LATER]: real form action lives in components/BookingForm.tsx.

import type { Metadata } from "next";
import BookingForm from "@/components/BookingForm";

export const metadata: Metadata = {
  title: "Book a session — Teyung Tattook Ink",
  description:
    "Tell us your idea and your dates in Kathmandu — we reply within a day. Thamel, Kathmandu · English spoken · Single-use needles · Walk-ins & bookings.",
};

export default function BookPage() {
  return <BookingForm />;
}
