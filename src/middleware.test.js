import { describe, expect, it } from "vitest";
import { middleware } from "./middleware";

function req(path, hasToken = false) {
  const url = `http://localhost:5002${path}`;
  return {
    url,
    nextUrl: new URL(url),
    cookies: {
      get: (name) => (hasToken && name === "token" ? { value: "jwt.value" } : undefined),
    },
  };
}

const locationOf = (response) => response.headers.get("location");

describe("middleware route guard (SECURITY_AND_AUTH)", () => {
  it.each(["/appointments", "/profile", "/appointments/123"])(
    "redirects unauthenticated users from %s to /login with a next param",
    (path) => {
      const res = middleware(req(path));
      const url = new URL(locationOf(res));
      expect(url.pathname).toBe("/login");
      expect(url.searchParams.get("next")).toBe(path);
    },
  );

  it.each(["/appointments", "/profile"])("lets authenticated users through %s", (path) => {
    const res = middleware(req(path, true));
    expect(locationOf(res)).toBeNull();
  });

  it("redirects authenticated users away from /login and /register", () => {
    for (const path of ["/login", "/register"]) {
      const url = new URL(locationOf(middleware(req(path, true))));
      expect(url.pathname).toBe("/");
    }
  });

  it("leaves public pages untouched for guests", () => {
    for (const path of ["/", "/doctors", "/doctors/abc", "/login", "/register"]) {
      expect(locationOf(middleware(req(path)))).toBeNull();
    }
  });

  it("preserves the query string inside the next param", () => {
    const res = middleware(req("/appointments?tab=upcoming"));
    const url = new URL(locationOf(res));
    expect(url.searchParams.get("next")).toBe("/appointments?tab=upcoming");
  });
});
