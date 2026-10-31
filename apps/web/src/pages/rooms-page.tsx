import type { Room } from "@hotel/shared";
import { useSearchParams } from "react-router-dom";
import { RoomCard } from "../components/room-card";
import { SearchForm } from "../components/search-form";
import { useApiResource } from "../lib/use-api-resource";
import { formatDate, isoDateFromToday } from "../lib/format";

const DEFAULT_CHECK_IN_OFFSET_DAYS = 14;
const DEFAULT_STAY_NIGHTS = 2;

/** Rooms available for the stay described by the query string or default upcoming dates. */
export function RoomsPage() {
  const [params] = useSearchParams();
  const checkIn = params.get("checkIn") ?? isoDateFromToday(DEFAULT_CHECK_IN_OFFSET_DAYS);
  const checkOut = params.get("checkOut") ?? isoDateFromToday(DEFAULT_CHECK_IN_OFFSET_DAYS + DEFAULT_STAY_NIGHTS);
  const adults = params.get("adults") ?? "2";

  const stayQuery = new URLSearchParams({ checkIn, checkOut, adults }).toString();
  const resource = useApiResource<{ rooms: Room[] }>(`/api/rooms?${stayQuery}`);

  return (
    <main className="mx-auto max-w-7xl space-y-12 px-6 py-12 md:py-16">
      {/* Editorial Collection Header */}
      <div className="space-y-3">
        <span className="font-brand text-[10px] sm:text-[11px] uppercase tracking-[0.26em] text-[#8F7255] font-semibold block">
          The Collection · Rheinsprung Basel
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#1F1E1D] tracking-tight font-light">
          Suites and apartments
        </h1>
        <div className="bronze-line"></div>
        <p className="text-xs sm:text-sm text-[#6C6862] max-w-xl leading-relaxed font-light pt-2">
          Ten curated residences designed with natural Swiss timber, local stone, and panoramic views overlooking the Rhine or the historic rooftops of Basel.
        </p>
      </div>

      {/* Architectural search console */}
      <div className="pt-2">
        <SearchForm key={stayQuery} checkIn={checkIn} checkOut={checkOut} adults={adults} />
      </div>

      <section aria-label="Available rooms" className="space-y-8 pt-4">
        {resource.status === "loading" && (
          <div className="py-24 text-center space-y-3">
            <div className="inline-block h-6 w-6 animate-spin border border-[#1F1E1D]/20 border-t-[#1F1E1D]"></div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#6C6862] font-medium">
              Checking availability for your stay…
            </p>
          </div>
        )}

        {resource.status === "error" && (
          <div role="alert" className="border border-red-300 bg-red-50/50 p-6 text-xs text-red-800">
            {resource.error.message}
          </div>
        )}

        {resource.status === "success" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#6C6862] gap-2 border-b border-[#1F1E1D]/10 pb-4">
              <span className="font-light text-[#1F1E1D]">
                Showing <strong className="font-medium">{resource.data.rooms.length} suites available</strong> for {formatDate(checkIn)} — {formatDate(checkOut)}
              </span>
              <span className="text-[10px] text-[#8F7255] tracking-[0.18em] uppercase font-medium">
                Artisanal breakfast &amp; BaselCard included
              </span>
            </div>

            {resource.data.rooms.length === 0 ? (
              <div className="border border-[#1F1E1D]/10 bg-white p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm">
                <h2 className="font-serif text-2xl font-light text-[#1F1E1D]">No suites available for these dates</h2>
                <p className="text-xs text-[#6C6862] leading-relaxed font-light">
                  Please try different dates or fewer guests using the search form above.
                </p>
              </div>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {resource.data.rooms.map((room, index) => (
                  <div
                    key={room.id}
                    className="animate-card"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <RoomCard room={room} stayQuery={stayQuery} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
