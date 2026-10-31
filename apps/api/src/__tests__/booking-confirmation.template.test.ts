import type { Booking } from "@hotel/shared";
import { describe, expect, it } from "vitest";
import { renderBookingConfirmationEmail } from "../email/booking-confirmation.template";

const BOOKING = {
  id: "booking-1",
  reference: "BSL-AB123",
  room: {
    id: "room-1",
    name: "River Suite",
    type: "suite",
    description: "A suite",
    capacity: 2,
    pricePerNight: 1200,
    imageUrl: "/rooms/suite.webp",
  },
  checkIn: "2030-06-10",
  checkOut: "2030-06-13",
  adults: 2,
  nights: 3,
  totalPrice: 3600,
  status: "confirmed",
  holdUntil: null,
  guestName: "Ada Test",
  guestEmail: "ada@example.test",
  guestPhone: "+41 00 000 00 00",
  confirmationEmailSent: false,
} satisfies Booking;

describe("renderBookingConfirmationEmail", () => {
  it("puts the reference in the subject and the stay details in both bodies", () => {
    const { subject, html, text } = renderBookingConfirmationEmail(BOOKING);
    expect(subject).toContain("BSL-AB123");
    for (const body of [html, text]) {
      expect(body).toContain("BSL-AB123");
      expect(body).toContain("River Suite");
      expect(body).toContain("10 June 2030");
      expect(body).toContain("13 June 2030");
      expect(body).toContain("3 nights");
    }
  });

  it("escapes guest-provided text in the HTML body", () => {
    const { html } = renderBookingConfirmationEmail({ ...BOOKING, guestName: "<script>alert(1)</script>" });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
