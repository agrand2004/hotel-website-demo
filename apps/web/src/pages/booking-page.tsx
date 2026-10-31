import type { Booking, Room } from "@hotel/shared";
import { type FormEvent, useId, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ApiError, apiPost } from "../lib/api";
import { formatChf, formatDate } from "../lib/format";
import { useApiResource } from "../lib/use-api-resource";
import { DEMO_GUEST } from "../lib/demo-guest";

/** Guest details form; creates a pending booking then moves on to the confirmation review. */
export function BookingPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const roomId = params.get("roomId");
  const checkIn = params.get("checkIn") ?? "";
  const checkOut = params.get("checkOut") ?? "";
  const adults = Number(params.get("adults") ?? "2");
  const stayQuery = new URLSearchParams({ checkIn, checkOut, adults: String(adults) }).toString();
  const room = useApiResource<{ room: Room }>(roomId ? `/api/rooms/${roomId}?${stayQuery}` : null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const guestHelpId = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || room.status !== "success") return;
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const { booking } = await apiPost<{ booking: Booking }>("/api/bookings", {
        roomId: form.get("roomId"),
        checkIn: form.get("checkIn"),
        checkOut: form.get("checkOut"),
        adults: Number(form.get("adults")),
        guestName: form.get("guestName"),
        guestEmail: form.get("guestEmail"),
        guestPhone: form.get("guestPhone"),
      });
      navigate(`/confirmation/${booking.id}`);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Could not create the demo reservation. Please try again.");
      setSubmitting(false);
    }
  }

  if (!roomId || !checkIn || !checkOut) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20 space-y-4">
        <p className="font-serif text-2xl font-light text-[#1F1E1D]">Please select your dates and suite first.</p>
        <Link to="/rooms" className="inline-block text-[11px] uppercase tracking-[0.2em] text-[#1F1E1D] underline">
          ← Browse accommodations
        </Link>
      </main>
    );
  }

  if (room.status !== "success") {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20 space-y-4">
        <p role={room.status === "error" ? "alert" : "status"} className="text-sm text-[#6C6862]">
          {room.status === "error" ? room.error.message : "Checking your selected room…"}
        </p>
        <Link to={`/rooms?${stayQuery}`} className="inline-block text-[11px] uppercase tracking-[0.2em] text-[#1F1E1D] underline">
          ← Choose a room
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl space-y-10 px-6 py-12 md:py-20">
      <div className="space-y-3">
        <span className="font-brand text-[10px] uppercase tracking-[0.26em] text-[#8F7255] font-semibold block">
          Reservation · Step 1 of 2
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-[#1F1E1D] tracking-tight font-light">
          Your reservation details
        </h1>
        <div className="bronze-line"></div>
      </div>

      {room.status === "success" && (
        <div className="bg-white border border-[#1F1E1D]/12 p-5 sm:p-7 shadow-sm space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-baseline border-b border-[#1F1E1D]/10 pb-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8F7255] font-medium block">
                Selected Suite
              </span>
              <p className="font-serif text-2xl font-light text-[#1F1E1D] mt-0.5">{room.data.room.name}</p>
            </div>
            <span className="font-serif text-2xl text-[#1F1E1D] font-normal whitespace-nowrap">
              {formatChf(room.data.room.pricePerNight)} <span className="text-xs text-[#6C6862] font-sans font-light">/ night</span>
            </span>
          </div>
          <div className="flex flex-wrap justify-between gap-3 text-xs text-[#6C6862] font-light">
            <span><strong className="font-medium text-[#1F1E1D]">Stay:</strong> {formatDate(checkIn)} — {formatDate(checkOut)}</span>
            <span><strong className="font-medium text-[#1F1E1D]">Party:</strong> {adults} {adults === 1 ? "Guest" : "Guests"}</span>
            <span className="text-[#8F7255] font-medium">Artisanal Breakfast Included</span>
          </div>
        </div>
      )}

      {/* Semantic Form */}
      <form method="post" onSubmit={handleSubmit} className="space-y-6 bg-white border border-[#1F1E1D]/15 p-5 sm:p-10 shadow-lg shadow-black/5" aria-label="Guest details">
        <input type="hidden" name="roomId" value={roomId} />
        <input type="hidden" name="checkIn" value={checkIn} />
        <input type="hidden" name="checkOut" value={checkOut} />
        <input type="hidden" name="adults" value={adults} />
        <div className="space-y-1 border-b border-[#1F1E1D]/10 pb-4">
          <h2 className="font-serif text-2xl font-light text-[#1F1E1D]">Lead Guest Information</h2>
          <p id={guestHelpId} className="text-xs text-[#6C6862] font-light leading-relaxed">A demo guest is prefilled. You can edit these details; use fictitious information only.</p>
        </div>

        <div className="space-y-5">
          <label className="flex flex-col text-[10px] uppercase tracking-[0.22em] font-medium text-[#8F7255] cursor-pointer">
            <span className="mb-2">Guest name</span>
            <input
              name="guestName"
              type="text"
              required
              autoComplete="off"
              defaultValue={DEMO_GUEST.guestName}
              aria-describedby={guestHelpId}
              className="border border-[#1F1E1D]/20 bg-[#FAF8F5] px-4 py-3.5 text-base sm:text-sm font-normal normal-case tracking-normal text-[#1F1E1D] transition-colors duration-200 focus:outline-none focus:border-[#1F1E1D] focus:bg-white"
            />
          </label>

          <label className="flex flex-col text-[10px] uppercase tracking-[0.22em] font-medium text-[#8F7255] cursor-pointer">
            <span className="mb-2">Demo email address</span>
            <input
              name="guestEmail"
              type="email"
              required
              autoComplete="off"
              defaultValue={DEMO_GUEST.guestEmail}
              aria-describedby={guestHelpId}
              className="border border-[#1F1E1D]/20 bg-[#FAF8F5] px-4 py-3.5 text-base sm:text-sm font-normal normal-case tracking-normal text-[#1F1E1D] transition-colors duration-200 focus:outline-none focus:border-[#1F1E1D] focus:bg-white"
            />
          </label>

          <label className="flex flex-col text-[10px] uppercase tracking-[0.22em] font-medium text-[#8F7255] cursor-pointer">
            <span className="mb-2">Telephone / Mobile</span>
            <input
              name="guestPhone"
              type="tel"
              required
              autoComplete="off"
              defaultValue={DEMO_GUEST.guestPhone}
              aria-describedby={guestHelpId}
              className="border border-[#1F1E1D]/20 bg-[#FAF8F5] px-4 py-3.5 text-base sm:text-sm font-normal normal-case tracking-normal text-[#1F1E1D] transition-colors duration-200 focus:outline-none focus:border-[#1F1E1D] focus:bg-white"
            />
          </label>
        </div>

        {/* Demonstration policy banner */}
        <div className="bg-[#FAF8F5] border border-[#1F1E1D]/10 p-5 text-xs text-[#6C6862] leading-relaxed font-light">
          <strong className="text-[#1F1E1D] font-medium block mb-1">Demonstration Site · Safe by Design</strong>
          No payment is taken and no email is sent. Your demo room is held for 15 minutes while you review and confirm on the next screen.
        </div>

        {errorMessage && (
          <p role="alert" className="text-xs text-red-800 bg-red-50 p-4 border border-red-300">
            {errorMessage}
          </p>
        )}

        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to={`/rooms/${roomId}?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}`}
            className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#6C6862] hover:text-[#1F1E1D] text-center sm:text-left"
          >
            ← Modify Selection
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#1F1E1D] hover:bg-[#8F7255] text-[#FAF8F5] px-8 py-4 text-[11px] uppercase tracking-[0.22em] font-medium transition-colors duration-300 disabled:opacity-50 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F1E1D] text-center"
          >
            {submitting ? "Processing…" : "Continue to Review & Confirm →"}
          </button>
        </div>
      </form>
    </main>
  );
}
