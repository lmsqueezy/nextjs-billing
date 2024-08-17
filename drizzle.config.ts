/* eslint-disable @typescript-eslint/no-non-null-assertion -- allow */

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.POSTGRES_URL! },
  verbose: true,
  strict: true,
});
