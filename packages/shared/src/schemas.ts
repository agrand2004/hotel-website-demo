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

/** Room as returned by `GET /api/rooms` and `GET /api/rooms/:id`. */
export const roomSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  description: z.string(),
  capacity: z.number().int(),
  pricePerNight: z.number().int(),
  imageUrl: z.string(),
});
export type Room = z.infer<typeof roomSchema>;

/** Booking as returned by the `/api/bookings` endpoints. */
export const bookingSchema = z.object({
  id: z.string(),
  reference: z.string(),
  room: roomSchema,
  checkIn: isoDateSchema,
  checkOut: isoDateSchema,
  adults: z.number().int(),
  nights: z.number().int(),
  totalPrice: z.number().int(),
  status: z.enum(BOOKING_STATUSES),
  holdUntil: z.string().nullable(),
  guestName: z.string(),
  guestEmail: z.string(),
  guestPhone: z.string(),
});
export type Booking = z.infer<typeof bookingSchema>;
