import type { Room } from "@hotel/shared";
import { useSearchParams } from "react-router-dom";
import { RoomCard } from "../components/room-card";
import { SearchForm } from "../components/search-form";
import { useApiResource } from "../lib/use-api-resource";
import { formatDate } from "../lib/format";

/** Rooms available for the stay described by the query string. */
export function RoomsPage() {
  const [params] = useSearchParams();
  const checkIn = params.get("checkIn") ?? undefined;
  const checkOut = params.get("checkOut") ?? undefined;
  const adults = params.get("adults") ?? undefined;
  const hasStay = checkIn !== undefined && checkOut !== undefined && adults !== undefined;
  const stayQuery = hasStay ? new URLSearchParams({ checkIn, checkOut, adults }).toString() : "";
  const resource = useApiResource<{ rooms: Room[] }>(hasStay ? `/api/rooms?${stayQuery}` : null);

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <h1 className="font-serif text-3xl">Rooms</h1>
      <SearchForm checkIn={checkIn} checkOut={checkOut} adults={adults} />
      {!hasStay && <p>Choose your dates to see the rooms available.</p>}
      {hasStay && resource.status === "loading" && <p>Loading rooms…</p>}
      {hasStay && resource.status === "error" && <p role="alert">{resource.error.message}</p>}
      {hasStay && resource.status === "success" && (
        <section aria-label="Available rooms">
          <p className="mb-4 text-sm">
            {resource.data.rooms.length} rooms available from {formatDate(checkIn)} to {formatDate(checkOut)}
          </p>
          {resource.data.rooms.length === 0 && <p>No room is available for these dates. Try other dates.</p>}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resource.data.rooms.map((room) => (
              <RoomCard key={room.id} room={room} stayQuery={stayQuery} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
