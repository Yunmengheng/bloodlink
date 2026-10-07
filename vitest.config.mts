import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // Mirrors the "@/*" path mapping in tsconfig.json, so test files can
      // import modules exactly the way application code does.
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    // Domain logic in lib/ is pure TypeScript, so a Node environment is enough.
    environment: "node",
    include: ["lib/**/*.test.ts", "tests/**/*.test.ts"],
  },
});
