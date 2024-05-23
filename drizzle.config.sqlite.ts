/* eslint-disable @typescript-eslint/no-non-null-assertion -- allow */

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema-sqlite.ts",
  out: "./src/db/migrations",
  driver:"turso",
  dialect:"sqlite",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
  verbose: true,
  strict: true,
});
