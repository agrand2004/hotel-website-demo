import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { bookingsRoutes } from "./routes/bookings";
import { roomsRoutes } from "./routes/rooms";

export const app = new Hono();

app.use("/api/*", cors());
app.get("/api/health", (c) => c.json({ status: "ok" }));
app.route("/api/rooms", roomsRoutes);
app.route("/api/bookings", bookingsRoutes);

app.onError((error, c) => {
  if (error instanceof HTTPException) return error.getResponse();
  console.error(error);
  return c.json({ error: { code: "internal_error", message: "Internal server error" } }, 500);
});
