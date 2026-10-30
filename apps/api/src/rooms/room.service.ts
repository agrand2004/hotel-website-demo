import type { Room } from "@hotel/shared";
import { prisma } from "../db";
import { httpError } from "../lib/http-error";

/**
 * Prisma filter matching rooms that already have a blocking booking
 * overlapping `[checkIn, checkOut)`: confirmed, or pending with a live hold.
 */
function overlappingBlockingBooking(params: { checkIn: Date; checkOut: Date; now: Date }) {
  return {
    checkIn: { lt: params.checkOut },
    checkOut: { gt: params.checkIn },
    OR: [
      { status: "confirmed" as const },
      { status: "pending" as const, holdUntil: { gt: params.now } },
    ],
  };
}

/**
 * Lists the rooms free for the whole stay and large enough for the party.
 * @param params.checkIn - arrival date
 * @param params.checkOut - departure date (exclusive)
 * @param params.adults - number of adults
 * @returns available rooms, cheapest first
 */
export async function findAvailableRooms(params: {
  checkIn: Date;
  checkOut: Date;
  adults: number;
}): Promise<Room[]> {
  return prisma.room.findMany({
    where: {
      capacity: { gte: params.adults },
      bookings: { none: overlappingBlockingBooking({ ...params, now: new Date() }) },
    },
    orderBy: { pricePerNight: "asc" },
  });
}

/**
 * Checks that a room is free for the whole stay.
 * @param params.roomId - room to check
 * @param params.checkIn - arrival date
 * @param params.checkOut - departure date (exclusive)
 * @returns true when no blocking booking overlaps the stay
 */
export async function isRoomAvailable(params: {
  roomId: string;
  checkIn: Date;
  checkOut: Date;
}): Promise<boolean> {
  const count = await prisma.booking.count({
    where: {
      roomId: params.roomId,
      ...overlappingBlockingBooking({ ...params, now: new Date() }),
    },
  });
  return count === 0;
}

/**
 * Finds a room by id.
 * @param roomId - room id
 * @returns the room
 * @throws a 404 HTTP error when the room does not exist
 */
export async function getRoom(roomId: string): Promise<Room> {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) {
    throw httpError({ status: 404, code: "room_not_found", message: "Room not found" });
  }
  return room;
}
