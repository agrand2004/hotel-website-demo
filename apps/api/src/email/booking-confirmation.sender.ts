import type { Booking } from "@hotel/shared";
import { Resend } from "resend";
import { renderBookingConfirmationEmail } from "./booking-confirmation.template";

/** Sender used when `RESEND_FROM_EMAIL` is unset: Resend's shared test domain, which only delivers to the account owner. */
const DEFAULT_FROM = "Rheinblick <onboarding@resend.dev>";

/**
 * Sends the confirmation email of a confirmed booking through Resend.
 * Never throws: a missing API key or a Resend failure is logged and reported as `false`,
 * so the booking itself is never rolled back by an email problem.
 * @param booking - the confirmed booking
 * @returns `true` when Resend accepted the email, `false` otherwise
 */
export async function sendBookingConfirmationEmail(booking: Booking): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`RESEND_API_KEY is not set: no confirmation email sent for booking ${booking.reference}`);
    return false;
  }
  const { subject, html, text } = renderBookingConfirmationEmail(booking);
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM,
      to: booking.guestEmail,
      subject,
      html,
      text,
    });
    if (error) {
      console.error(`Resend rejected the confirmation email for booking ${booking.reference}`, error);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`Could not send the confirmation email for booking ${booking.reference}`, error);
    return false;
  }
}
