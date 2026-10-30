import { zValidator } from "@hono/zod-validator";
import { createBookingBodySchema } from "@hotel/shared";
import { Hono } from "hono";
import { confirmBooking, createPendingBooking, getBooking } from "../bookings/booking.service";

export const bookingsRoutes = new Hono()
  .post("/", zValidator("json", createBookingBodySchema), async (c) => {
    const booking = await createPendingBooking(c.req.valid("json"));
    return c.json({ booking }, 201);
  })
  .get("/:id", async (c) => c.json({ booking: await getBooking(c.req.param("id")) }))
  .post("/:id/confirm", async (c) => c.json({ booking: await confirmBooking(c.req.param("id")) }));
