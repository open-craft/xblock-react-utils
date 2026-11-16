import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["src/testSetup.ts"],
    environment: "jsdom",
    globals: true,
    onConsoleLog(log) {
      // MockJax doesn't allow us to suppress this info with the way
      // we import it.
      if (log.includes("Initializing Mockjax and adding methods to jQuery")) {
        return false;
      }
    },
    coverage: {
      provider: "v8",
      enabled: true,
      reporter: ["text", "html"],
      reportsDirectory: "../coverage",
      exclude: ["src/**/*.test.*"],
      include: ["src/**/*.{ts,tsx}"],
      thresholds: {
        functions: 100,
        lines: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
