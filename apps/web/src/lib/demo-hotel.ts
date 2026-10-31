import { bookingSchema, createBookingBodySchema, roomSearchQuerySchema } from "@hotel/shared";
import type { Booking, RoomSearchQuery } from "@hotel/shared";
import data from "../data/demo-hotel.json";
import { ApiError } from "./api-error";

export const DEMO_GUEST = data.guest;
export const DEMO_STORAGE_KEY = "rheinblick-demo-bookings-v1";
const DAY_MS = 86_400_000;
const HOLD_MS = 15 * 60_000;
type DemoStorage = Pick<Storage, "getItem" | "setItem">;

function fail(status: number, code: string, message: string): never {
  throw new ApiError({ status, code, message });
}

function dateMs(value: string): number {
  const ms = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(ms) || new Date(ms).toISOString().slice(0, 10) !== value) {
    fail(400, "invalid_date", "Please choose valid arrival and departure dates.");
  }
  return ms;
}

function overlaps(a: Pick<RoomSearchQuery, "checkIn" | "checkOut">, b: Pick<RoomSearchQuery, "checkIn" | "checkOut">) {
  return a.checkIn < b.checkOut && a.checkOut > b.checkIn;
}

/** shortcut: inventory is local to one tab; use the server for shared availability. */
export function createDemoHotel(storage?: DemoStorage, now: () => number = Date.now) {
  let bookings: Booking[] = [];
  try {
    const saved = bookingSchema.array().safeParse(JSON.parse(storage?.getItem(DEMO_STORAGE_KEY) ?? "[]"));
    if (saved.success) bookings = saved.data;
  } catch {
    // An unavailable or damaged browser store must not prevent the demo from opening.
  }

  function persist() {
    try {
      storage?.setItem(DEMO_STORAGE_KEY, JSON.stringify(bookings));
    } catch {
      // Keep this visit usable in memory when browser storage is disabled or full.
    }
  }

  function expireHolds() {
    for (const booking of bookings) {
      if (booking.status === "pending" && (!booking.holdUntil || Date.parse(booking.holdUntil) <= now())) {
        booking.status = "expired";
        booking.holdUntil = null;
      }
    }
  }

  function validateStay(input: unknown) {
    const parsed = roomSearchQuerySchema.safeParse(input);
    if (!parsed.success) fail(400, "invalid_search", "Please choose valid dates and between 1 and 6 guests.");
    const stay = parsed.data;
    const arrival = dateMs(stay.checkIn);
    const departure = dateMs(stay.checkOut);
    if (stay.checkIn < new Date(now()).toISOString().slice(0, 10)) {
      fail(400, "past_arrival", "Arrival must be today or a future date.");
    }
    if (departure <= arrival) fail(400, "invalid_stay", "Departure must be after arrival.");
    return stay;
  }

  function isAvailable(roomId: string, stay: RoomSearchQuery) {
    expireHolds();
    const today = dateMs(new Date(now()).toISOString().slice(0, 10));
    const seededConflict = data.unavailableStays.some((slot) => slot.roomId === roomId && overlaps(stay, {
      checkIn: new Date(today + slot.checkInOffsetDays * DAY_MS).toISOString().slice(0, 10),
      checkOut: new Date(today + slot.checkOutOffsetDays * DAY_MS).toISOString().slice(0, 10),
    }));
    return !seededConflict && !bookings.some((booking) =>
      booking.room.id === roomId && booking.status !== "expired" && overlaps(stay, booking),
    );
  }

  function getRoom(id: string, input?: unknown) {
    const room = data.rooms.find((candidate) => candidate.id === id);
    if (!room) fail(404, "room_not_found", "This room could not be found. Please choose another room.");
    if (input !== undefined) {
      const stay = validateStay(input);
      if (stay.adults > room.capacity) fail(400, "room_capacity_exceeded", "This room cannot accommodate that many guests.");
      if (!isAvailable(id, stay)) fail(409, "room_unavailable", "This room is unavailable for these dates. Please choose another room or change your dates.");
    }
    return room;
  }

  function searchRooms(input: unknown) {
    const stay = validateStay(input);
    return data.rooms.filter((room) => room.capacity >= stay.adults && isAvailable(room.id, stay));
  }

  function createBooking(input: unknown): Booking {
    const parsed = createBookingBodySchema.safeParse(input);
    if (!parsed.success) fail(400, "invalid_booking", "Please select a room, valid dates and the demo guest details.");
    const body = parsed.data;
    const room = getRoom(body.roomId, body);
    const nights = (dateMs(body.checkOut) - dateMs(body.checkIn)) / DAY_MS;
    const id = crypto.randomUUID();
    const booking: Booking = {
      id, reference: `DEMO-${id.slice(0, 8).toUpperCase()}`, room,
      checkIn: body.checkIn, checkOut: body.checkOut, adults: body.adults,
      nights, totalPrice: nights * room.pricePerNight,
      status: "pending", holdUntil: new Date(now() + HOLD_MS).toISOString(),
      guestName: body.guestName, guestEmail: body.guestEmail, guestPhone: body.guestPhone,
    };
    bookings.push(booking);
    persist();
    return { ...booking };
  }

  function getBooking(id: string): Booking {
    expireHolds();
    const booking = bookings.find((candidate) => candidate.id === id);
    if (!booking) fail(404, "booking_not_found", "This demo reservation was not found in this tab. Please start a new reservation.");
    return { ...booking };
  }

  function confirmBooking(id: string): Booking {
    const booking = getBooking(id);
    if (booking.status === "expired") fail(409, "booking_hold_expired", "Your 15-minute hold has expired. Please choose your room again.");
    if (booking.status === "confirmed") return booking;
    booking.status = "confirmed";
    booking.holdUntil = null;
    bookings = bookings.map((candidate) => candidate.id === id ? booking : candidate);
    persist();
    return { ...booking };
  }

  return { searchRooms, getRoom, createBooking, getBooking, confirmBooking };
}
