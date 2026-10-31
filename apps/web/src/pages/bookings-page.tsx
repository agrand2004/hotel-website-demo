import type { Booking, BookingStatus } from "@hotel/shared";
import { Link } from "react-router-dom";
import { formatChf, formatDate } from "../lib/format";
import { useApiResource } from "../lib/use-api-resource";

const STATUS_STYLES = {
  confirmed: "border-[#1F1E1D] bg-[#1F1E1D] text-[#FAF8F5]",
  pending: "border-[#8F7255] text-[#8F7255]",
  expired: "border-[#1F1E1D]/20 text-[#6C6862]",
} as const satisfies Record<BookingStatus, string>;

const HEADER_CELL = "px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-[#8F7255] font-semibold";
const BODY_CELL = "px-4 py-4 align-top";

function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`inline-block border px-2 py-1 text-[10px] uppercase tracking-[0.18em] font-medium ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

function BookingRow({ booking }: { booking: Booking }) {
  return (
    <tr className="border-t border-[#1F1E1D]/10">
      <td className={`${BODY_CELL} font-mono text-[#1F1E1D] whitespace-nowrap`}>{booking.reference}</td>
      <td className={BODY_CELL}>
        <span className="block text-[#1F1E1D]">{booking.guestName}</span>
        <span className="block text-[#6C6862] break-all">{booking.guestEmail}</span>
        <span className="block text-[#6C6862]">{booking.guestPhone}</span>
      </td>
      <td className={`${BODY_CELL} text-[#1F1E1D]`}>{booking.room.name}</td>
      <td className={`${BODY_CELL} text-[#1F1E1D] whitespace-nowrap`}>
        {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
        <span className="block text-[#6C6862]">{booking.nights} {booking.nights === 1 ? "night" : "nights"} · {booking.adults} {booking.adults === 1 ? "adult" : "adults"}</span>
      </td>
      <td className={`${BODY_CELL} text-[#1F1E1D] whitespace-nowrap`}>{formatChf(booking.totalPrice)}</td>
      <td className={BODY_CELL}><StatusBadge status={booking.status} /></td>
    </tr>
  );
}

/** Back-office list of every reservation with the guest who made it. */
export function BookingsPage() {
  const resource = useApiResource<{ bookings: Booking[] }>("/api/bookings");

  return (
    <main className="mx-auto min-h-[80vh] max-w-7xl space-y-12 px-6 pt-12 pb-24 md:pt-16 md:pb-32">
      <div className="space-y-3">
        <span className="font-brand text-[10px] sm:text-[11px] uppercase tracking-[0.26em] text-[#8F7255] font-semibold block">
          Front desk · Rheinsprung Basel
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#1F1E1D] tracking-tight font-light">Reservations</h1>
        <div className="bronze-line"></div>
        <p className="text-xs sm:text-sm text-[#6C6862] max-w-xl leading-relaxed font-light pt-2">
          Every demo reservation, newest first, with the guest who made it. Fictitious data only.
        </p>
      </div>

      <section aria-label="Reservations" className="space-y-6">
        {resource.status === "loading" && (
          <div className="py-24 text-center space-y-3">
            <div className="inline-block h-6 w-6 animate-spin border border-[#1F1E1D]/20 border-t-[#1F1E1D]"></div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#6C6862] font-medium">Loading reservations…</p>
          </div>
        )}

        {resource.status === "error" && (
          <div role="alert" className="border border-red-300 bg-red-50/50 p-6 text-xs text-red-800">{resource.error.message}</div>
        )}

        {resource.status === "success" && resource.data.bookings.length === 0 && (
          <div className="border border-[#1F1E1D]/10 bg-white p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm">
            <h2 className="font-serif text-2xl font-light text-[#1F1E1D]">No reservations yet</h2>
            <p className="text-xs text-[#6C6862] leading-relaxed font-light">Bookings made on the site will appear here.</p>
            <Link to="/rooms" className="inline-block text-[11px] uppercase tracking-[0.2em] text-[#1F1E1D] underline">Find a room →</Link>
          </div>
        )}

        {resource.status === "success" && resource.data.bookings.length > 0 && (
          <>
            <p className="text-xs text-[#1F1E1D] font-light border-b border-[#1F1E1D]/10 pb-4">
              <strong className="font-medium">{resource.data.bookings.length}</strong> {resource.data.bookings.length === 1 ? "reservation" : "reservations"}
            </p>
            <div className="overflow-x-auto border border-[#1F1E1D]/10 bg-white shadow-sm">
              <table className="w-full min-w-[56rem] text-left text-xs font-light">
                <thead>
                  <tr>
                    <th scope="col" className={HEADER_CELL}>Reference</th>
                    <th scope="col" className={HEADER_CELL}>Guest</th>
                    <th scope="col" className={HEADER_CELL}>Room</th>
                    <th scope="col" className={HEADER_CELL}>Stay</th>
                    <th scope="col" className={HEADER_CELL}>Total</th>
                    <th scope="col" className={HEADER_CELL}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {resource.data.bookings.map((booking) => <BookingRow key={booking.id} booking={booking} />)}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
