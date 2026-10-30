import type { Booking } from "@hotel/shared";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BookingSummary } from "../components/booking-summary";
import { ApiError, apiPost } from "../lib/api";
import { useApiResource } from "../lib/use-api-resource";

/** Recap of a pending booking with the explicit confirmation step, then the confirmed booking. */
export function ConfirmationPage() {
  const { bookingId } = useParams();
  const resource = useApiResource<{ booking: Booking }>(bookingId ? `/api/bookings/${bookingId}` : null);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function handleConfirm() {
    setConfirming(true);
    setErrorMessage(null);
    try {
      const { booking } = await apiPost<{ booking: Booking }>(`/api/bookings/${bookingId}/confirm`);
      setConfirmed(booking);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Could not reach the server.");
    } finally {
      setConfirming(false);
    }
  }

  if (resource.status === "loading") return <main className="mx-auto max-w-2xl p-6">Loading booking…</main>;
  if (resource.status === "error") {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p role="alert">{resource.error.message}</p>
      </main>
    );
  }

  const booking = confirmed ?? resource.data.booking;
  const isConfirmed = booking.status === "confirmed";
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-6 py-10">
      <h1 className="font-serif text-3xl">{isConfirmed ? "Booking confirmed" : "Review your booking"}</h1>
      {isConfirmed && (
        <p>
          Thank you, {booking.guestName}. Your reference is <strong>{booking.reference}</strong>.
        </p>
      )}
      <BookingSummary booking={booking} />
      {booking.status === "pending" && (
        <>
          <p className="text-sm">Your room is held for 15 minutes. Nothing is booked until you confirm.</p>
          {errorMessage && <p role="alert" className="text-red-700">{errorMessage}</p>}
          <button type="button" onClick={handleConfirm} disabled={confirming} className="rounded bg-forest px-6 py-3 text-cream hover:opacity-90 disabled:opacity-50">
            Confirm booking
          </button>
        </>
      )}
      {booking.status === "expired" && <p role="alert">This booking has expired. Please start a new search.</p>}
      {(isConfirmed || booking.status === "expired") && (
        <Link to="/" className="underline">Back to home</Link>
      )}
    </main>
  );
}
