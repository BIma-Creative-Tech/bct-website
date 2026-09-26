import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Pola sama dengan web-starter (referensi platform VPS). Alias "@" = root repo (tsconfig paths "./*").
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
  },
});
