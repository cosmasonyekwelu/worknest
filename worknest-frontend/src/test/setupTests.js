import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

beforeAll(() => {
  vi.stubEnv("VITE_WORKNEST_BASE_URL", "http://localhost:5000");
});

afterEach(() => {
  cleanup();
});

afterAll(() => {
  vi.unstubAllEnvs();
});
