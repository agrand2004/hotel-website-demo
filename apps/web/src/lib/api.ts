import { ApiError } from "./api-error";
import { createDemoHotel } from "./demo-hotel";

export { ApiError } from "./api-error";

let storage: Storage | undefined;
try {
  storage = window.sessionStorage;
} catch {
  // Restricted browser contexts still get an in-memory demo.
}
const hotel = createDemoHotel(storage);

/**
 * Resolves the existing page contracts locally; no HTTP request or backend is needed.
 * @param path - path starting with `/api`
 * @returns the resource in the existing API response shape
 * @throws {ApiError} on invalid dates, unavailable rooms or missing records
 */
export async function apiGet<T>(path: string): Promise<T> {
  const url = new URL(path, "https://demo.example");
  const query = Object.fromEntries(url.searchParams);
  if (url.pathname === "/api/rooms") return { rooms: hotel.searchRooms(query) } as T;
  const room = url.pathname.match(/^\/api\/rooms\/([^/]+)$/);
  if (room?.[1]) return { room: hotel.getRoom(room[1], url.search ? query : undefined) } as T;
  const booking = url.pathname.match(/^\/api\/bookings\/([^/]+)$/);
  if (booking?.[1]) return { booking: hotel.getBooking(booking[1]) } as T;
  throw new ApiError({ status: 404, code: "not_found", message: "This demo page could not be found." });
}

/**
 * Applies a local demo booking action, preserving the explicit confirmation step.
 * @param path - path starting with `/api`
 * @param body - JSON-serialisable payload, omitted when undefined
 * @returns the pending or confirmed demo booking
 * @throws {ApiError} when the booking cannot be created or confirmed
 */
export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  if (path === "/api/bookings") return { booking: hotel.createBooking(body) } as T;
  const confirmation = path.match(/^\/api\/bookings\/([^/]+)\/confirm$/);
  if (confirmation?.[1]) return { booking: hotel.confirmBooking(confirmation[1]) } as T;
  throw new ApiError({ status: 404, code: "not_found", message: "This demo action could not be found." });
}
