import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const fromRoot = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": fromRoot("./src"),
      // "server-only" throws outside the Next.js server bundle
      "server-only": fromRoot("./tests/helpers/empty.ts"),
    },
  },
  test: {
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    // Integration tests run against a separate SQLite file, never dev.db
    env: { DATABASE_URL: "file:./test.db" },
    globalSetup: ["tests/helpers/global-setup.ts"],
    fileParallelism: false,
  },
});
