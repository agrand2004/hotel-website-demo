import type { Booking } from "@hotel/shared";
import { formatChf, formatDate } from "../lib/format";

/** Read-only recap of a stay inspired by Lingers booking summary. */
export function BookingSummary(props: { booking: Pick<Booking, "room" | "checkIn" | "checkOut" | "adults" | "nights" | "totalPrice"> }) {
  const { booking } = props;
  return (
    <div className="bg-white border border-[#1F1E1D]/12 p-7 md:p-9 shadow-sm space-y-6">
      <div className="border-b border-[#1F1E1D]/10 pb-4">
        <span className="font-brand text-[10px] uppercase tracking-[0.24em] text-[#8F7255] font-semibold block">
          Accommodation Summary
        </span>
        <h3 className="font-serif text-2xl sm:text-3xl font-light text-[#1F1E1D] tracking-tight mt-1">
          {booking.room.name}
        </h3>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-3.5 text-xs text-[#1F1E1D] font-light">
        <dt className="text-[#6C6862] text-[10px] uppercase tracking-[0.2em] font-medium">Arrival</dt>
        <dd className="font-normal text-right sm:text-left">{formatDate(booking.checkIn)} (from 15:00)</dd>
        <dt className="text-[#6C6862] text-[10px] uppercase tracking-[0.2em] font-medium">Departure</dt>
        <dd className="font-normal text-right sm:text-left">{formatDate(booking.checkOut)} (until 11:00)</dd>
        <dt className="text-[#6C6862] text-[10px] uppercase tracking-[0.2em] font-medium">Guests</dt>
        <dd className="font-normal text-right sm:text-left">{booking.adults} {booking.adults === 1 ? "Guest" : "Guests"}</dd>
        <dt className="text-[#6C6862] text-[10px] uppercase tracking-[0.2em] font-medium">Duration</dt>
        <dd className="font-normal text-right sm:text-left">{booking.nights} {booking.nights === 1 ? "Night" : "Nights"}</dd>
        <dt className="text-[#6C6862] text-[10px] uppercase tracking-[0.2em] font-medium pt-4 border-t border-[#1F1E1D]/10">Total Amount</dt>
        <dd className="font-serif text-2xl text-[#1F1E1D] font-normal pt-4 border-t border-[#1F1E1D]/10 text-right sm:text-left">
          {formatChf(booking.totalPrice)} <span className="text-xs text-[#6C6862] font-sans font-light">incl. taxes &amp; breakfast</span>
        </dd>
      </dl>
    </div>
  );
}
