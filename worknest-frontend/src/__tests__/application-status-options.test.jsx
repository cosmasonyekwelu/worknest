import { describe, expect, it } from "vitest";
import {
  normalizeApplicationStatus,
  statusConfig,
} from "@/utils/constant";
import { APPLICATION_STATUS_VALUES } from "@/constants/applicationStatus";

describe("application status options", () => {
  it("matches the canonical backend-supported status list", () => {
    expect(statusConfig.map((status) => status.value)).toEqual([
      ...APPLICATION_STATUS_VALUES,
    ]);
  });

  it("drops unsupported legacy status values during normalization", () => {
    expect(normalizeApplicationStatus("pending")).toBe("");
    expect(normalizeApplicationStatus("viewed")).toBe("");
  });
});
