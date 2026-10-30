import { zValidator } from "@hono/zod-validator";
import { roomSearchQuerySchema } from "@hotel/shared";
import { Hono } from "hono";
import { countNights, parseIsoDate } from "../lib/dates";
import { httpError } from "../lib/http-error";
import { findAvailableRooms, getRoom } from "../rooms/room.service";

export const roomsRoutes = new Hono()
  .get("/", zValidator("query", roomSearchQuerySchema), async (c) => {
    const query = c.req.valid("query");
    const checkIn = parseIsoDate(query.checkIn);
    const checkOut = parseIsoDate(query.checkOut);
    if (countNights({ checkIn, checkOut }) < 1) {
      throw httpError({ status: 400, code: "invalid_stay", message: "Check-out must be after check-in" });
    }
    const rooms = await findAvailableRooms({ checkIn, checkOut, adults: query.adults });
    return c.json({ rooms });
  })
  .get("/:id", async (c) => c.json({ room: await getRoom(c.req.param("id")) }));
