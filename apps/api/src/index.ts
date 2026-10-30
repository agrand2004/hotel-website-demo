import { serve } from "@hono/node-server";
import { app } from "./app";

const DEFAULT_API_PORT = 3001;

const port = Number(process.env.API_PORT ?? DEFAULT_API_PORT);
serve({ fetch: app.fetch, port }, () => {
  console.log(`API listening on http://localhost:${port}`);
});
