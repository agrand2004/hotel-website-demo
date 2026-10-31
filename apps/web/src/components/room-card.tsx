import type { Room } from "@hotel/shared";
import { Link } from "react-router-dom";
import { formatChf } from "../lib/format";
import { roomImageSrcSet } from "../lib/room-images";

/** Summary card of a room in the search results inspired by Lingers suites catalog. */
export function RoomCard(props: { room: Room; stayQuery: string }) {
  const { room } = props;
  return (
    <article className="group flex flex-col justify-between overflow-hidden bg-white border border-[#1F1E1D]/10 transition-all duration-300 hover:border-[#8F7255]/60 hover:shadow-lg hover:shadow-black/5">
      <div>
        {/* Photography with slow subtle zoom */}
        <div className="relative aspect-[16/11] w-full overflow-hidden bg-[#FAF8F5]">
          <img
            src={room.imageUrl}
            srcSet={roomImageSrcSet(room.imageUrl)}
            sizes="(min-width: 1280px) 390px, (min-width: 1024px) calc((100vw - 112px) / 3), (min-width: 640px) calc((100vw - 80px) / 2), calc(100vw - 48px)"
            alt={room.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute top-4 left-4 border border-[#1F1E1D]/20 bg-white/95 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#1F1E1D]">
            {room.type}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-7 space-y-3">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#8F7255] font-medium block">
              Up to {room.capacity} {room.capacity === 1 ? "Guest" : "Guests"} · Rhine Promenade
            </span>
            <h2 className="font-serif text-2xl font-light tracking-tight text-[#1F1E1D] group-hover:text-[#8F7255] transition-colors">
              {room.name}
            </h2>
          </div>
          <p className="text-xs text-[#6C6862] leading-relaxed line-clamp-2 font-light">
            {room.description}
          </p>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="px-5 pb-5 sm:px-7 sm:pb-7 pt-4 border-t border-[#1F1E1D]/8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-[9px] uppercase tracking-[0.2em] text-[#6C6862] block">From</span>
          <div className="flex items-baseline gap-1 mt-0.5 whitespace-nowrap">
            <span className="font-serif text-2xl text-[#1F1E1D] font-normal">{formatChf(room.pricePerNight)}</span>
            <span className="text-[11px] text-[#6C6862] font-light">/ night</span>
          </div>
        </div>
        <Link
          to={`/rooms/${room.id}?${props.stayQuery}`}
          className="w-full sm:w-auto min-h-11 inline-flex items-center justify-center whitespace-nowrap border border-[#1F1E1D] bg-[#1F1E1D] text-[#FAF8F5] px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] font-medium transition-all duration-300 hover:bg-transparent hover:text-[#1F1E1D] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F1E1D]"
        >
          Discover &amp; Book
        </Link>
      </div>
    </article>
  );
}
