import type { Room } from "@hotel/shared";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { formatChf, formatDate, isoDateFromToday } from "../lib/format";
import { useApiResource } from "../lib/use-api-resource";
import { roomImageSrcSet } from "../lib/room-images";

const DEFAULT_CHECK_IN_OFFSET_DAYS = 14;
const DEFAULT_STAY_NIGHTS = 2;

/** Detail of one room, inspired by Lingers' suites presentation. */
export function RoomDetailPage() {
  const { roomId } = useParams();
  const [params] = useSearchParams();

  const checkIn = params.get("checkIn") || isoDateFromToday(DEFAULT_CHECK_IN_OFFSET_DAYS);
  const checkOut = params.get("checkOut") || isoDateFromToday(DEFAULT_CHECK_IN_OFFSET_DAYS + DEFAULT_STAY_NIGHTS);
  const adults = params.get("adults") || "2";
  const stayQuery = new URLSearchParams({ checkIn, checkOut, adults }).toString();
  const resource = useApiResource<{ room: Room }>(roomId ? `/api/rooms/${roomId}?${stayQuery}` : null);

  const bookingQuery = new URLSearchParams({
    roomId: roomId ?? "",
    checkIn,
    checkOut,
    adults,
  }).toString();

  if (resource.status === "loading") {
    return (
      <main className="mx-auto max-w-5xl px-6 py-24 text-center">
        <div className="inline-block h-6 w-6 animate-spin border border-[#1F1E1D]/20 border-t-[#1F1E1D]"></div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#6C6862] font-medium mt-3">
          Loading suite details…
        </p>
      </main>
    );
  }

  if (resource.status === "error") {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16 space-y-4">
        <div role="alert" className="border border-red-300 bg-red-50/50 p-6 text-xs text-red-800">
          {resource.error.message}
        </div>
        <Link to="/rooms" className="inline-block text-[11px] uppercase tracking-[0.2em] text-[#1F1E1D] underline">
          ← Return to all accommodations
        </Link>
      </main>
    );
  }

  const { room } = resource.data;
  return (
    <main className="mx-auto max-w-7xl space-y-12 px-6 py-12 md:py-16">
      {/* Return link */}
      <div>
        <Link
          to={`/rooms?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}`}
          className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] uppercase tracking-[0.22em] font-medium text-[#6C6862] hover:text-[#1F1E1D] transition-colors group"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1" aria-hidden="true">←</span>
          <span>Return to Collection</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Suite Photography & Architectural details */}
        <div className="lg:col-span-7 space-y-10">
          <div className="overflow-hidden bg-white border border-[#1F1E1D]/10 p-2 shadow-sm">
            <div className="aspect-[16/11] overflow-hidden bg-[#FAF8F5]">
              <img
                src={room.imageUrl}
                srcSet={roomImageSrcSet(room.imageUrl)}
                sizes="(min-width: 1280px) 700px, (min-width: 1024px) 58vw, calc(100vw - 64px)"
                alt={room.name}
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-103"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <span className="font-brand text-[10px] uppercase tracking-[0.26em] text-[#8F7255] font-semibold block">
                Suite Category · {room.type}
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl text-[#1F1E1D] tracking-tight font-light">
                {room.name}
              </h1>
              <div className="bronze-line"></div>
            </div>

            <p className="text-xs sm:text-sm text-[#6C6862] leading-relaxed font-light pt-2">
              {room.description}
            </p>

            <div className="pt-8 border-t border-[#1F1E1D]/10 space-y-6">
              <h3 className="font-serif text-2xl font-light text-[#1F1E1D]">Curated Suite Inclusions</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#6C6862] font-light">
                <li className="flex items-center gap-3">
                  <span className="text-[#8F7255]">✦</span> Artisanal river-view breakfast included
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#8F7255]">✦</span> Historic Rhine cable-ferry boarding passes
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#8F7255]">✦</span> Walk-in Hansgrohe rain shower &amp; alpine botanicals
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#8F7255]">✦</span> Simmons handcrafted mattress &amp; washed linen
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#8F7255]">✦</span> Complimentary BaselCard (transport &amp; museums)
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-[#8F7255]">✦</span> Acoustic double glazing &amp; quiet writing nook
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Architectural Reservation Console */}
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <div className="bg-white border border-[#1F1E1D]/15 p-5 sm:p-8 shadow-lg shadow-black/5 space-y-6">
            <div className="flex justify-between items-baseline border-b border-[#1F1E1D]/10 pb-5">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#8F7255] block font-medium">Nightly Rate</span>
                <span className="font-serif text-3xl sm:text-4xl text-[#1F1E1D] font-light">{formatChf(room.pricePerNight)}</span>
              </div>
              <span className="text-xs text-[#6C6862] font-light">CHF / night</span>
            </div>

            {/* Stay Summary Panel */}
            <div className="bg-[#FAF8F5] border border-[#1F1E1D]/8 p-5 space-y-3.5 text-xs text-[#1F1E1D]">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#6C6862] font-medium">Stay Dates</span>
                <span className="font-medium text-[#1F1E1D]">{formatDate(checkIn)} — {formatDate(checkOut)}</span>
              </div>
              <div className="flex flex-wrap justify-between items-center gap-2 border-t border-[#1F1E1D]/8 pt-3">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#6C6862] font-medium">Guests</span>
                <span className="font-medium text-[#1F1E1D]">{adults} {adults === "1" ? "Guest" : "Guests"} (Max {room.capacity})</span>
              </div>
            </div>

            {/* Direct Booking CTA */}
            <Link
              to={`/book?${bookingQuery}`}
              className="w-full bg-[#1F1E1D] hover:bg-[#8F7255] text-[#FAF8F5] py-4 text-[11px] uppercase tracking-[0.22em] font-medium flex items-center justify-center gap-3 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F1E1D]"
            >
              <span>Reserve This Suite</span>
              <span aria-hidden="true" className="text-sm">→</span>
            </Link>

            <div className="text-center space-y-1 text-[10px] uppercase tracking-[0.14em] text-[#6C6862] pt-2">
              <p>Safe by design: 15-minute hold upon review</p>
              <p>No credit card required on demo</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
