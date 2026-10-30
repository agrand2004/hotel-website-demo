import type { Room } from "@hotel/shared";
import { Link } from "react-router-dom";
import { formatChf } from "../lib/format";

/** Summary card of a room in the search results. */
export function RoomCard(props: { room: Room; stayQuery: string }) {
  const { room } = props;
  return (
    <article className="overflow-hidden rounded bg-white shadow">
      <img src={room.imageUrl} alt={room.name} className="h-48 w-full object-cover" />
      <div className="space-y-2 p-4">
        <h2 className="font-serif text-xl">{room.name}</h2>
        <p className="text-sm">{room.type} · up to {room.capacity} guests</p>
        <p className="text-sm">{room.description}</p>
        <p className="font-semibold">{formatChf(room.pricePerNight)} / night</p>
        <Link
          to={`/rooms/${room.id}?${props.stayQuery}`}
          className="inline-block rounded bg-forest px-4 py-2 text-sm text-cream hover:opacity-90"
        >
          View room
        </Link>
      </div>
    </article>
  );
}
