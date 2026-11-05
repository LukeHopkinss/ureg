import { defineConfig } from "drizzle-kit";
import { requireDatabaseUrl } from "./env.js";

/**
 * `generate` works offline and never reads `url`; `migrate`/`push`/`studio`
 * read it and fail with a clear message when it is absent (docs/plan.md §9).
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./schema/index.ts",
  out: "./migrations",
  dbCredentials: {
    get url() {
      return requireDatabaseUrl();
    },
  },
});
