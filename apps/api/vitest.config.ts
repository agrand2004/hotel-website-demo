import { defineConfig } from "vitest/config";

// Tests hit the local Docker database configured in the root `.env`.
process.loadEnvFile("../../.env");

export default defineConfig({ test: { fileParallelism: false } });
