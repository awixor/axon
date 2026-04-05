import { describe, expect, it } from "vitest";
import { getIp, rateLimitResponse } from "./rate-limit";

describe("getIp", () => {
  it("returns the first IP from x-forwarded-for", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getIp(req)).toBe("1.2.3.4");
  });

  it("falls back to 127.0.0.1 when header is absent", () => {
    const req = new Request("http://localhost");
    expect(getIp(req)).toBe("127.0.0.1");
  });

  it("trims whitespace from the IP", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "  9.9.9.9  " },
    });
    expect(getIp(req)).toBe("9.9.9.9");
  });
});

describe("rateLimitResponse", () => {
  it("returns a 429 response", async () => {
    const res = rateLimitResponse(90);
    expect(res.status).toBe(429);
  });

  it("sets Retry-After header to the reset seconds", () => {
    const res = rateLimitResponse(90);
    expect(res.headers.get("Retry-After")).toBe("90");
  });

  it("rounds up to at least 1 minute in the error message", async () => {
    const res = rateLimitResponse(30);
    const body = await res.json();
    expect(body.error).toContain("1 minute");
  });

  it("uses plural 'minutes' for values > 1 minute", async () => {
    const res = rateLimitResponse(180);
    const body = await res.json();
    expect(body.error).toContain("3 minutes");
  });
});
