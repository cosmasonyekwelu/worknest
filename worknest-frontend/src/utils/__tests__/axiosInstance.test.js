import { describe, expect, it } from "vitest";
import { resolveApiBaseUrl } from "../axiosInstance";

describe("resolveApiBaseUrl", () => {
  it("falls back to localhost during tests when the env var is absent", () => {
    expect(
      resolveApiBaseUrl({
        rawBaseUrl: "",
        mode: "test",
      }),
    ).toBe("http://localhost:5000");
  });

  it("throws outside test mode when the env var is absent", () => {
    expect(() =>
      resolveApiBaseUrl({
        rawBaseUrl: "",
        mode: "production",
      }),
    ).toThrow("Missing VITE_WORKNEST_BASE_URL");
  });
});
