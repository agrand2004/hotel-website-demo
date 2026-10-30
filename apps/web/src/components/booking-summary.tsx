import type { Booking } from "@hotel/shared";
import { formatChf, formatDate } from "../lib/format";

/** Read-only recap of a stay: room, dates, guests and total price. */
export function BookingSummary(props: { booking: Pick<Booking, "room" | "checkIn" | "checkOut" | "adults" | "nights" | "totalPrice"> }) {
  const { booking } = props;
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded bg-white p-6 shadow">
      <dt className="font-semibold">Room</dt>
      <dd>{booking.room.name}</dd>
      <dt className="font-semibold">Check-in</dt>
      <dd>{formatDate(booking.checkIn)}</dd>
      <dt className="font-semibold">Check-out</dt>
      <dd>{formatDate(booking.checkOut)}</dd>
      <dt className="font-semibold">Guests</dt>
      <dd>{booking.adults} adults</dd>
      <dt className="font-semibold">Total ({booking.nights} nights)</dt>
      <dd>{formatChf(booking.totalPrice)}</dd>
    </dl>
  );
}
