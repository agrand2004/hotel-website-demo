import type { Booking } from "@hotel/shared";

/** Palette of the site (see DESIGN.md), inlined because email clients ignore stylesheets. */
const COLORS = {
  canvas: "#FAF8F5",
  card: "#FFFFFF",
  sand: "#F3EFEA",
  ink: "#1F1E1D",
  muted: "#6C6862",
  bronze: "#8F7255",
  hairline: "#E4DFD7",
} as const;

const SERIF = "Alice, Georgia, 'Times New Roman', serif";
const SANS = "'Plus Jakarta Sans', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";

/** Subject and bodies of a booking confirmation email. */
export interface BookingConfirmationEmail {
  subject: string;
  html: string;
  text: string;
}

/**
 * Escapes the characters that are significant in HTML, for guest-provided text.
 * @param value - raw text
 * @returns text safe to interpolate in an HTML body
 */
function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * Formats an ISO date as e.g. `Mon 10 June 2030` (UTC, so the day never shifts).
 * @param isoDate - `YYYY-MM-DD`
 * @returns the readable date
 */
function formatStayDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

/** One label / value row of the stay details table. */
function detailRow(params: { label: string; value: string }): string {
  return `<tr>
    <td style="padding:14px 0;border-top:1px solid ${COLORS.hairline};font:600 10px ${SANS};letter-spacing:0.22em;text-transform:uppercase;color:${COLORS.bronze};">${params.label}</td>
    <td align="right" style="padding:14px 0;border-top:1px solid ${COLORS.hairline};font:300 14px ${SANS};color:${COLORS.ink};">${params.value}</td>
  </tr>`;
}

/**
 * Renders the confirmation email of a confirmed booking, in the visual identity of the site.
 * @param booking - the confirmed booking
 * @returns subject, HTML body and plain-text fallback
 */
export function renderBookingConfirmationEmail(booking: Booking): BookingConfirmationEmail {
  const guestName = escapeHtml(booking.guestName);
  const roomName = escapeHtml(booking.room.name);
  const checkIn = formatStayDate(booking.checkIn);
  const checkOut = formatStayDate(booking.checkOut);
  const nights = `${booking.nights} ${booking.nights === 1 ? "night" : "nights"}`;
  const guests = `${booking.adults} ${booking.adults === 1 ? "adult" : "adults"}`;
  const total = `CHF ${booking.totalPrice.toLocaleString("en-CH")}`;
  const subject = `Your stay at Rheinblick is confirmed · ${booking.reference}`;

  const html = `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:${COLORS.canvas};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Reference ${booking.reference} · ${checkIn} to ${checkOut}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.canvas};">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;">
        <tr><td align="center" style="padding-bottom:28px;font:600 13px Cinzel, Georgia, serif;letter-spacing:0.32em;text-transform:uppercase;color:${COLORS.ink};">Rheinblick</td></tr>
        <tr><td style="background:${COLORS.card};border:1px solid ${COLORS.hairline};padding:44px 40px;">
          <p style="margin:0 0 12px;font:600 10px ${SANS};letter-spacing:0.26em;text-transform:uppercase;color:${COLORS.bronze};">Reservation confirmed</p>
          <h1 style="margin:0 0 20px;font:400 34px/1.15 ${SERIF};letter-spacing:-0.01em;color:${COLORS.ink};">Thank you, ${guestName}.</h1>
          <table role="presentation" width="48" cellpadding="0" cellspacing="0"><tr><td style="height:1px;background:${COLORS.bronze};font-size:0;line-height:0;">&nbsp;</td></tr></table>
          <p style="margin:20px 0 28px;font:300 14px/1.7 ${SANS};color:${COLORS.muted};">We look forward to welcoming you in Basel. Your fictional stay is confirmed — here are the details.</p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.canvas};border:1px solid ${COLORS.hairline};margin-bottom:28px;">
            <tr><td align="center" style="padding:22px 16px;">
              <p style="margin:0 0 6px;font:600 10px ${SANS};letter-spacing:0.22em;text-transform:uppercase;color:${COLORS.bronze};">Reference</p>
              <p style="margin:0;font:500 26px 'SFMono-Regular', Menlo, Consolas, monospace;letter-spacing:0.12em;color:${COLORS.ink};">${booking.reference}</p>
            </td></tr>
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${detailRow({ label: "Room", value: roomName })}
            ${detailRow({ label: "Check-in", value: checkIn })}
            ${detailRow({ label: "Check-out", value: checkOut })}
            ${detailRow({ label: "Stay", value: `${nights} · ${guests}` })}
            ${detailRow({ label: "Total", value: `<strong style="font:400 20px ${SERIF};">${total}</strong>` })}
          </table>
        </td></tr>
        <tr><td align="center" style="padding:28px 24px 0;font:300 11px/1.7 ${SANS};color:${COLORS.muted};">
          This is a demo. No payment has been taken and no real reservation exists.<br>Rheinblick Suites &amp; Residence · Basel
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    `Thank you, ${booking.guestName}.`,
    "Your fictional stay at Rheinblick is confirmed.",
    "",
    `Reference: ${booking.reference}`,
    `Room:      ${booking.room.name}`,
    `Check-in:  ${checkIn}`,
    `Check-out: ${checkOut}`,
    `Stay:      ${nights} · ${guests}`,
    `Total:     ${total}`,
    "",
    "This is a demo. No payment has been taken and no real reservation exists.",
  ].join("\n");

  return { subject, html, text };
}
