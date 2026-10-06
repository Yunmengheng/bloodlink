import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Domain logic in lib/ is pure TypeScript, so a Node environment is enough.
    environment: "node",
    include: ["lib/**/*.test.ts", "tests/**/*.test.ts"],
  },
});
