import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Node-side MSW server for Vitest (unit/component/integration tests).
export const server = setupServer(...handlers);
