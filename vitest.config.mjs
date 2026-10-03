import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.js"],
    css: false,
    // D-014: browser calls go direct to the backend when this is set. Vitest
    // loads .env files, so pin it empty here — the MSW handlers match the
    // relative paths the client uses when the variable is unset.
    env: { NEXT_PUBLIC_API_URL: "" },
    include: ["src/**/*.{test,spec}.{js,jsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/lib/**", "src/features/**"],
      // src/lib/utils.js is a one-line re-export of the `cn` package;
      // its behaviour is covered by utils.test.js.
      exclude: ["src/lib/utils.js"],
      thresholds: {
        lines: 80,
        "src/lib/**": { lines: 100 },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
