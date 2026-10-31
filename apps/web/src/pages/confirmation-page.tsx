import type { Booking } from "@hotel/shared";
import { type FormEvent, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BookingSummary } from "../components/booking-summary";
import { ApiError, apiPost } from "../lib/api";
import { useApiResource } from "../lib/use-api-resource";

/** Recap of a pending booking with explicit human confirmation step, then the confirmed voucher. */
export function ConfirmationPage() {
  const { bookingId } = useParams();
  const resource = useApiResource<{ booking: Booking }>(bookingId ? `/api/bookings/${bookingId}` : null);
  const [updatedBooking, setUpdatedBooking] = useState<Booking | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function handleConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (confirming) return;
    setConfirming(true);
    setErrorMessage(null);
    try {
      const { booking } = await apiPost<{ booking: Booking }>(`/api/bookings/${bookingId}/confirm`);
      setUpdatedBooking(booking);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Could not confirm the demo reservation. Please try again.");
      if (error instanceof ApiError && error.code === "booking_hold_expired" && resource.status === "success") {
        setUpdatedBooking({ ...resource.data.booking, status: "expired", holdUntil: null });
      }
    } finally {
      setConfirming(false);
    }
  }

  if (resource.status === "loading") {
    return (
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <div className="inline-block h-6 w-6 animate-spin border border-[#1F1E1D]/20 border-t-[#1F1E1D]"></div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#6C6862] font-medium mt-3">
          Loading booking details…
        </p>
      </main>
    );
  }

  if (resource.status === "error") {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 space-y-4">
        <p role="alert" className="border border-red-300 bg-red-50 p-4 text-xs text-red-800">
          {resource.error.message}
        </p>
        <Link to="/rooms" className="inline-block text-[11px] uppercase tracking-[0.2em] text-[#1F1E1D] underline">Choose a room →</Link>
      </main>
    );
  }

  const booking = updatedBooking && updatedBooking.id === bookingId ? updatedBooking : resource.data.booking;
  const isConfirmed = booking.status === "confirmed";

  return (
    <main className="mx-auto max-w-2xl space-y-10 px-6 py-12 md:py-20">
      <div className="space-y-3">
        <span className="font-brand text-[10px] uppercase tracking-[0.26em] text-[#8F7255] font-semibold block">
          {isConfirmed ? "Demo Confirmation" : booking.status === "expired" ? "Reservation expired" : "Step 2 of 2 · Explicit Confirmation"}
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#1F1E1D] tracking-tight font-light">
          {isConfirmed ? "Reservation confirmed" : booking.status === "expired" ? "Your hold has expired" : "Review & confirm"}
        </h1>
        <div className="bronze-line"></div>
      </div>

      {isConfirmed ? (
        <div className="bg-white border border-[#1F1E1D]/15 p-5 sm:p-10 shadow-lg shadow-black/5 space-y-6">
          <div className="flex items-start sm:items-center gap-4 border-b border-[#1F1E1D]/10 pb-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#1F1E1D] bg-[#1F1E1D] text-[#FAF8F5] text-sm">
              ✓
            </span>
            <div className="min-w-0 [overflow-wrap:anywhere]">
              <p className="font-serif text-2xl sm:text-3xl font-light text-[#1F1E1D]">
                Thank you, {booking.guestName}.
              </p>
              <p className="text-xs text-[#6C6862] font-light mt-0.5">Your fictional stay at Rheinblick is confirmed for this demo.</p>
            </div>
          </div>

          {/* Reference Voucher Card */}
          <div className="bg-[#FAF8F5] border border-[#1F1E1D]/12 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.22em] text-[#8F7255] font-semibold block">
                Demo Reference Code
              </span>
              <span className="font-mono text-lg sm:text-2xl font-medium text-[#1F1E1D] tracking-wider mt-1 block break-all">
                {booking.reference}
              </span>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#6C6862] font-medium block">Booking Status</span>
              <span className="text-xs text-[#1F1E1D] font-medium uppercase tracking-wider block mt-1">Confirmed · Demo only</span>
            </div>
          </div>

          <div
            role="status"
            className="flex items-start gap-4 border border-[#1F1E1D]/12 bg-[#F3EFEA] p-4 sm:p-5"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-[#8F7255]" fill="none" stroke="currentColor" strokeWidth="1.25">
              <rect x="3" y="5" width="18" height="14" />
              <path d="m3 6 9 7 9-7" />
            </svg>
            <div className="min-w-0 [overflow-wrap:anywhere]">
              <span className="text-[10px] uppercase tracking-[0.22em] text-[#8F7255] font-semibold block">
                {booking.confirmationEmailSent ? "Confirmation email sent" : "Confirmation email not sent"}
              </span>
              <p className="text-xs text-[#6C6862] leading-relaxed font-light mt-1">
                {booking.confirmationEmailSent
                  ? <>We have sent your booking details to <strong className="font-medium text-[#1F1E1D]">{booking.guestEmail}</strong>. If it does not arrive within a few minutes, check your spam folder.</>
                  : "We could not send the confirmation email. Keep your reference code above: your reservation is confirmed."}
              </p>
            </div>
          </div>

          <p className="text-xs text-[#6C6862] leading-relaxed font-light">No payment has been taken.</p>
        </div>
      ) : null}

      <BookingSummary booking={booking} />

      {booking.status === "expired" && (
        <div className="space-y-4 text-sm text-[#6C6862]">
          <p role="alert">Your 15-minute hold has expired. Please check availability and choose your room again.</p>
          <Link to={`/rooms?${new URLSearchParams({ checkIn: booking.checkIn, checkOut: booking.checkOut, adults: String(booking.adults) })}`} className="inline-block text-[11px] uppercase tracking-[0.2em] text-[#1F1E1D] underline">Check availability →</Link>
        </div>
      )}

      {booking.status === "pending" && (
        <form method="post" onSubmit={handleConfirm} aria-label="Confirm reservation" className="bg-white border border-[#1F1E1D]/15 p-5 sm:p-10 shadow-lg shadow-black/5 space-y-6">
          <input type="hidden" name="bookingId" value={booking.id} />
          <div className="space-y-2 text-xs text-[#6C6862] leading-relaxed font-light border-b border-[#1F1E1D]/10 pb-5">
            <span className="font-brand text-[10px] uppercase tracking-[0.24em] text-[#8F7255] font-semibold block">
              Safe By Design Policy
            </span>
            <p>
              Your demo suite is temporarily held for 15 minutes. Review your dates and total, then confirm below to complete this fictional reservation.
            </p>
          </div>

          {errorMessage && (
            <p role="alert" className="text-xs text-red-800 bg-red-50 p-4 border border-red-300">
              {errorMessage}
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Link
              to="/rooms"
              className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#6C6862] hover:text-[#1F1E1D] text-center sm:text-left"
            >
              Browse other rooms
            </Link>
            <button
              type="submit"
              disabled={confirming}
              className="bg-[#1F1E1D] hover:bg-[#8F7255] text-[#FAF8F5] px-8 py-4 text-[11px] uppercase tracking-[0.22em] font-medium transition-colors duration-300 disabled:opacity-50 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F1E1D] text-center"
            >
              {confirming ? "Confirming…" : "Confirm Reservation (Free Demo) →"}
            </button>
          </div>
        </form>
      )}

      {isConfirmed && (
        <div className="text-center pt-4">
          <Link
            to="/"
            className="inline-block border border-[#1F1E1D] text-[#1F1E1D] hover:bg-[#1F1E1D] hover:text-[#FAF8F5] px-8 py-3.5 text-[10px] uppercase tracking-[0.22em] font-medium transition-colors duration-300"
          >
            Return to Homepage
          </Link>
        </div>
      )}
    </main>
  );
}
