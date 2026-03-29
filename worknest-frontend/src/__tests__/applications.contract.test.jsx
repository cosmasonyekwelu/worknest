import MockAdapter from "axios-mock-adapter";
import { afterEach, describe, expect, it } from "vitest";
import axiosInstance from "@/utils/axiosInstance";
import {
  getApplicationById,
  getAllApplications,
  getMyApplications,
  normalizeApplication,
} from "@/api/applications";

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

  it("accepts empty paginated responses when totalPages is zero", async () => {
    axiosMock.onGet("/applications/me").reply(200, {
      success: true,
      message: "Applications retrieved successfully",
      data: {
        data: [],
        total: 0,
        page: 1,
        totalPages: 0,
      },
    });

    const result = await getMyApplications({
      page: 1,
      limit: 10,
      accessToken: "token-1",
    });

    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
    expect(result.items).toEqual([]);
  });

  it("accepts admin application responses when applicant is an id string", async () => {
    axiosMock.onGet("/applications").reply(200, {
      success: true,
      message: "Applications retrieved successfully",
      data: {
        data: [
          {
            _id: "application-1",
            applicant: "697c2888ff79a60ecbe9d542",
            status: "shortlisted",
            createdAt: "2026-03-21T00:26:33.238Z",
            answers: [],
            interview_questions: [],
            personalInfo: {
              firstname: "Cosmas",
              lastname: "Onyekwelu",
              email: "onyecval@gmail.com",
              phone: "+2348053091974",
              currentLocation: "Nigeria",
            },
            job: {
              _id: "job-1",
              title: "Data Scientist",
              companyName: "AI Talent Solutions",
              location: "Remote",
            },
          },
        ],
        total: 38,
        page: 1,
        totalPages: 4,
      },
    });

    const result = await getAllApplications({
      page: 1,
      limit: 10,
      accessToken: "token-1",
    });

    expect(result.total).toBe(38);
    expect(result.totalPages).toBe(4);
    expect(result.items[0].applicant.name).toBe("Cosmas Onyekwelu");
    expect(result.items[0].applicant.email).toBe("onyecval@gmail.com");
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
    ).rejects.toThrow("Invalid response from server for getMyApplications");
  });

  it("normalizes application detail responses with requirement and companyLogo fields", async () => {
    axiosMock.onGet("/applications/application-1").reply(200, {
      success: true,
      message: "Application retrieved successfully",
      data: {
        _id: "application-1",
        status: "submitted",
        createdAt: "2026-03-29T10:00:00.000Z",
        personalInfo: {
          firstname: "Ada",
          lastname: "Lovelace",
          email: "ada@example.com",
        },
        answers: [],
        interview_questions: [],
        job: {
          _id: "job-1",
          title: "Frontend Engineer",
          companyName: "WorkNest",
          location: "Remote",
          requirement: ["React"],
          companyLogo: "https://cdn.example.com/logo.webp",
        },
      },
    });

    const result = await getApplicationById({
      id: "application-1",
      accessToken: "token-1",
    });

    expect(result.job.requirement).toEqual(["React"]);
    expect(result.job.companyLogo).toBe("https://cdn.example.com/logo.webp");
  });

  it("normalizes malformed answers payloads without crashing", () => {
    const result = normalizeApplication({
      _id: "application-2",
      answers: "{not-json",
      personalInfo: "{\"firstname\":\"Ada\"}",
      job: {
        _id: "job-2",
        title: "Backend Engineer",
        companyName: "WorkNest",
      },
    });

    expect(result.answers).toEqual([]);
    expect(result.personalInfo).toEqual({ firstname: "Ada" });
    expect(result.applicant.name).toBe("Ada");
  });
});
