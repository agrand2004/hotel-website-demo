import type { Booking, CreateBookingBody } from "@hotel/shared";
import { prisma } from "../db";
import { sendBookingConfirmationEmail } from "../email/booking-confirmation.sender";
import { generateBookingReference } from "../lib/booking-reference";
import { countNights, parseIsoDate, toIsoDate } from "../lib/dates";
import { httpError } from "../lib/http-error";
import { getRoom, isRoomAvailable } from "../rooms/room.service";

/** How long a pending booking blocks its room. */
export const HOLD_DURATION_MS = 15 * 60 * 1000;

type BookingWithRoom = NonNullable<Awaited<ReturnType<typeof findBookingRow>>>;

function findBookingRow(id: string) {
  return prisma.booking.findUnique({ where: { id }, include: { room: true } });
}

/** Maps a Prisma booking row to the public booking shape. */
function toBooking(row: BookingWithRoom): Booking {
  const nights = countNights({ checkIn: row.checkIn, checkOut: row.checkOut });
  return {
    id: row.id,
    reference: row.reference,
    room: row.room,
    checkIn: toIsoDate(row.checkIn),
    checkOut: toIsoDate(row.checkOut),
    adults: row.adults,
    nights,
    totalPrice: row.totalPrice,
    status: row.status,
    holdUntil: row.holdUntil ? row.holdUntil.toISOString() : null,
    guestName: row.guestName,
    guestEmail: row.guestEmail,
    guestPhone: row.guestPhone,
    confirmationEmailSent: row.confirmationEmailSentAt !== null,
  };
}

/**
 * Lists every booking, newest first. A pending booking whose hold has lapsed is reported as `expired`,
 * even though its row is only flipped when someone tries to confirm it.
 * @returns all bookings with their room and guest details
 */
export async function listBookings(): Promise<Booking[]> {
  const rows = await prisma.booking.findMany({ include: { room: true }, orderBy: { createdAt: "desc" } });
  const now = new Date();
  return rows.map((row) => {
    const booking = toBooking(row);
    const holdLapsed = row.status === "pending" && row.holdUntil !== null && row.holdUntil <= now;
    return holdLapsed ? { ...booking, status: "expired", holdUntil: null } : booking;
  });
}

/**
 * Creates a `pending` booking that holds the room for {@link HOLD_DURATION_MS}.
 * @param body - validated booking request
 * @returns the pending booking, to be confirmed by the guest
 * @throws 400 on an invalid stay or too many guests, 404 on an unknown room, 409 when the room is taken
 */
export async function createPendingBooking(body: CreateBookingBody): Promise<Booking> {
  const checkIn = parseIsoDate(body.checkIn);
  const checkOut = parseIsoDate(body.checkOut);
  const nights = countNights({ checkIn, checkOut });
  if (nights < 1) {
    throw httpError({ status: 400, code: "invalid_stay", message: "Check-out must be after check-in" });
  }
  const room = await getRoom(body.roomId);
  if (body.adults > room.capacity) {
    throw httpError({ status: 400, code: "room_capacity_exceeded", message: "Too many guests for this room" });
  }
  if (!(await isRoomAvailable({ roomId: room.id, checkIn, checkOut }))) {
    throw httpError({ status: 409, code: "room_unavailable", message: "Room is not available for these dates" });
  }
  const row = await prisma.booking.create({
    data: {
      reference: generateBookingReference(),
      roomId: room.id,
      checkIn,
      checkOut,
      adults: body.adults,
      totalPrice: nights * room.pricePerNight,
      status: "pending",
      holdUntil: new Date(Date.now() + HOLD_DURATION_MS),
      guestName: body.guestName,
      guestEmail: body.guestEmail,
      guestPhone: body.guestPhone,
    },
    include: { room: true },
  });
  return toBooking(row);
}

/**
 * Finds a booking by id.
 * @param id - booking id
 * @returns the booking
 * @throws a 404 HTTP error when the booking does not exist
 */
export async function getBooking(id: string): Promise<Booking> {
  const row = await findBookingRow(id);
  if (!row) {
    throw httpError({ status: 404, code: "booking_not_found", message: "Booking not found" });
  }
  return toBooking(row);
}

/**
 * Confirms a pending booking while its hold is still live (idempotent on confirmed bookings).
 * @param id - booking id
 * @returns the confirmed booking
 * @throws 404 when unknown, 409 when the hold has expired
 */
export async function confirmBooking(id: string): Promise<Booking> {
  const row = await findBookingRow(id);
  if (!row) {
    throw httpError({ status: 404, code: "booking_not_found", message: "Booking not found" });
  }
  if (row.status === "confirmed") return toBooking(row);
  const holdExpired = row.status === "expired" || !row.holdUntil || row.holdUntil <= new Date();
  if (holdExpired) {
    await prisma.booking.update({ where: { id }, data: { status: "expired" } });
    throw httpError({ status: 409, code: "booking_hold_expired", message: "The hold on this room has expired" });
  }
  const confirmed = await prisma.booking.update({
    where: { id },
    data: { status: "confirmed", holdUntil: null },
    include: { room: true },
  });
  const booking = toBooking(confirmed);
  const emailSent = await sendBookingConfirmationEmail(booking);
  if (!emailSent) return booking;
  const notified = await prisma.booking.update({
    where: { id },
    data: { confirmationEmailSentAt: new Date() },
    include: { room: true },
  });
  return toBooking(notified);
}
