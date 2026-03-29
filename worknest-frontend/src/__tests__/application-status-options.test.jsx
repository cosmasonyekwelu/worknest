import { describe, expect, it } from "vitest";
import {
  getAllowedApplicationStatusOptions,
  normalizeApplicationStatus,
  statusConfig,
} from "@/utils/constant";
import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_VALUES,
} from "@/constants/applicationStatus";

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

  it("only exposes valid next statuses for an offer-stage application", () => {
    expect(
      getAllowedApplicationStatusOptions(APPLICATION_STATUSES.OFFER).map(
        (status) => status.value,
      ),
    ).toEqual([
      APPLICATION_STATUSES.REJECTED,
      APPLICATION_STATUSES.HIRED,
    ]);
  });
});
