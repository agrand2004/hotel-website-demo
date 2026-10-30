import { z } from "zod";

/** Calendar date as `YYYY-MM-DD`. */
export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/** Query of `GET /api/rooms`. */
export const roomSearchQuerySchema = z.object({
  checkIn: isoDateSchema,
  checkOut: isoDateSchema,
  adults: z.coerce.number().int().min(1).max(6),
});
export type RoomSearchQuery = z.infer<typeof roomSearchQuerySchema>;

/** Body of `POST /api/bookings`. */
export const createBookingBodySchema = z.object({
  roomId: z.string().min(1),
  checkIn: isoDateSchema,
  checkOut: isoDateSchema,
  adults: z.number().int().min(1).max(6),
  guestName: z.string().min(1),
  guestEmail: z.string().email(),
  guestPhone: z.string().min(1),
});
export type CreateBookingBody = z.infer<typeof createBookingBodySchema>;

export const BOOKING_STATUSES = ["pending", "confirmed", "expired"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
