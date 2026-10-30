import type { Booking, Room } from "@hotel/shared";
import { type FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ApiError, apiPost } from "../lib/api";
import { formatChf } from "../lib/format";
import { useApiResource } from "../lib/use-api-resource";

/** Guest details form; creates a pending booking then moves on to the recap. */
export function BookingPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const roomId = params.get("roomId");
  const checkIn = params.get("checkIn") ?? "";
  const checkOut = params.get("checkOut") ?? "";
  const adults = Number(params.get("adults") ?? "2");
  const room = useApiResource<{ room: Room }>(roomId ? `/api/rooms/${roomId}` : null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const { booking } = await apiPost<{ booking: Booking }>("/api/bookings", {
        roomId,
        checkIn,
        checkOut,
        adults,
        guestName: form.get("guestName"),
        guestEmail: form.get("guestEmail"),
        guestPhone: form.get("guestPhone"),
      });
      navigate(`/confirmation/${booking.id}`);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Could not reach the server.");
      setSubmitting(false);
    }
  }

  if (!roomId || !checkIn || !checkOut) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p>Choose a room first.</p>
        <Link to="/rooms" className="underline">Browse rooms</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-6 py-10">
      <h1 className="font-serif text-3xl">Your details</h1>
      {room.status === "success" && (
        <p>
          {room.data.room.name}, {checkIn} to {checkOut}, {adults} adults · {formatChf(room.data.room.pricePerNight)} / night
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4" aria-label="Guest details">
        <label className="flex flex-col text-sm">
          Full name
          <input name="guestName" type="text" required autoComplete="name" className="mt-1 rounded border border-forest/30 p-2" />
        </label>
        <label className="flex flex-col text-sm">
          Email
          <input name="guestEmail" type="email" required autoComplete="email" className="mt-1 rounded border border-forest/30 p-2" />
        </label>
        <label className="flex flex-col text-sm">
          Phone
          <input name="guestPhone" type="tel" required autoComplete="tel" className="mt-1 rounded border border-forest/30 p-2" />
        </label>
        <p className="text-sm">No payment is taken on this demo site.</p>
        {errorMessage && <p role="alert" className="text-red-700">{errorMessage}</p>}
        <button type="submit" disabled={submitting} className="rounded bg-forest px-6 py-3 text-cream hover:opacity-90 disabled:opacity-50">
          Review booking
        </button>
      </form>
    </main>
  );
}
