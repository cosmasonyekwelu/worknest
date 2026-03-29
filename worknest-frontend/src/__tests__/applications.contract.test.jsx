import MockAdapter from "axios-mock-adapter";
import { afterEach, describe, expect, it } from "vitest";
import axiosInstance from "@/utils/axiosInstance";
import { getMyApplications } from "@/api/applications";

describe("applications API contracts", () => {
  const axiosMock = new MockAdapter(axiosInstance);

  afterEach(() => {
    axiosMock.reset();
  });

  it("accepts the expected paginated applications envelope", async () => {
    axiosMock.onGet("/applications/me").reply(200, {
      success: true,
      message: "Applications retrieved successfully",
      data: {
        data: [
          {
            _id: "application-1",
            status: "submitted",
            createdAt: "2026-03-29T10:00:00.000Z",
            answers: [],
            interview_questions: [],
            personalInfo: {
              firstname: "Ada",
              lastname: "Lovelace",
              email: "ada@example.com",
            },
            job: {
              _id: "job-1",
              title: "Frontend Engineer",
              companyName: "WorkNest",
              location: "Remote",
            },
          },
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      },
    });

    const result = await getMyApplications({
      page: 1,
      limit: 10,
      accessToken: "token-1",
    });

    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.items[0].applicant.name).toBe("Ada Lovelace");
    expect(result.items[0].job.title).toBe("Frontend Engineer");
  });

  it("throws when the response shape drifts from the expected contract", async () => {
    axiosMock.onGet("/applications/me").reply(200, {
      success: true,
      message: "Applications retrieved successfully",
      data: [{ id: "broken-shape" }],
    });

    await expect(
      getMyApplications({
        page: 1,
        limit: 10,
        accessToken: "token-1",
      }),
    ).rejects.toThrow("Invalid response from server");
  });
});
