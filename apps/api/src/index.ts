import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

const DEFAULT_API_PORT = 3001;

const app = new Hono();
app.use("/api/*", cors());
app.get("/api/health", (c) => c.json({ status: "ok" }));

const port = Number(process.env.API_PORT ?? DEFAULT_API_PORT);
serve({ fetch: app.fetch, port }, () => {
  console.log(`API listening on http://localhost:${port}`);
});
