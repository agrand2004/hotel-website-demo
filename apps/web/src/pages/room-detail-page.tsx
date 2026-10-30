import type { Room } from "@hotel/shared";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { formatChf } from "../lib/format";
import { useApiResource } from "../lib/use-api-resource";

/** Detail of one room, with the link that starts the booking for the searched stay. */
export function RoomDetailPage() {
  const { roomId } = useParams();
  const [params] = useSearchParams();
  const resource = useApiResource<{ room: Room }>(roomId ? `/api/rooms/${roomId}` : null);
  const bookingQuery = new URLSearchParams({
    roomId: roomId ?? "",
    checkIn: params.get("checkIn") ?? "",
    checkOut: params.get("checkOut") ?? "",
    adults: params.get("adults") ?? "2",
  }).toString();

  if (resource.status === "loading") return <main className="mx-auto max-w-5xl p-6">Loading room…</main>;
  if (resource.status === "error") {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <p role="alert">{resource.error.message}</p>
        <Link to="/rooms" className="underline">Back to rooms</Link>
      </main>
    );
  }
  const { room } = resource.data;
  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-6 py-10 md:grid-cols-2">
      <img src={room.imageUrl} alt={room.name} className="w-full rounded object-cover" />
      <div className="space-y-4">
        <h1 className="font-serif text-4xl">{room.name}</h1>
        <p>{room.type} · up to {room.capacity} guests</p>
        <p>{room.description}</p>
        <p className="text-xl font-semibold">{formatChf(room.pricePerNight)} / night</p>
        <Link to={`/book?${bookingQuery}`} className="inline-block rounded bg-forest px-6 py-3 text-cream hover:opacity-90">
          Book this room
        </Link>
      </div>
    </main>
  );
}
