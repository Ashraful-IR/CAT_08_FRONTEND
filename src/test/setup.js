import "@testing-library/jest-dom/vitest";

// Radix Dialog (and other primitives) use ResizeObserver, which jsdom lacks.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = ResizeObserverStub;
}

// jest-axe's matcher is the ecosystem standard; vitest-axe (a stale wrapper of it)
// does not export it compatibly with vitest 5, so we extend expect directly.
import { afterEach, beforeAll, afterAll, expect } from "vitest";
import { cleanup } from "@testing-library/react";
import { toHaveNoViolations } from "jest-axe";
import { server } from "@/mocks/node";

expect.extend(toHaveNoViolations);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());
