import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = readFileSync(path.join(root, "../../next.config.mjs"), "utf8");

describe("security headers (SECURITY_AND_AUTH)", () => {
  it("sets nosniff, referrer policy, and frame denial", () => {
    expect(nextConfig).toContain("X-Content-Type-Options");
    expect(nextConfig).toContain("nosniff");
    expect(nextConfig).toContain("Referrer-Policy");
    expect(nextConfig).toContain("strict-origin-when-cross-origin");
    expect(nextConfig).toContain("X-Frame-Options");
    expect(nextConfig).toContain("DENY");
  });
});

describe("SEO surface", () => {
  it("exposes a sitemap", async () => {
    const sitemapPath = path.join(root, "sitemap.js");
    expect(existsSync(sitemapPath)).toBe(true);
    const { default: sitemap } = await import("./sitemap");
    const entries = await sitemap();
    const paths = entries.map((entry) => entry.url.replace(/\/$/, ""));
    expect(paths).toContain("http://localhost:5002/doctors");
    expect(paths).toContain("http://localhost:5002/login");
  });

  it("exposes robots that allows indexing but blocks private areas", async () => {
    const { default: robots } = await import("./robots");
    const rules = await robots();
    expect(rules.rules.disallow).toEqual(["/api/", "/appointments", "/profile"]);
    expect(rules.sitemap).toBeTruthy();
  });
});
