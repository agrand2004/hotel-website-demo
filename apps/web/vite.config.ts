import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const WEB_PORT = 5173;
const API_URL = "http://localhost:3001";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: WEB_PORT, proxy: { "/api": API_URL } },
});
