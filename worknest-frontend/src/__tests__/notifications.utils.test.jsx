import {
  getNotificationDestination,
  getNotificationId,
  isNotificationRead,
} from "@/utils/notifications";
import { describe, expect, it } from "vitest";

describe("notification helpers", () => {
  it("builds the admin destination from job and application ids", () => {
    const notification = {
      _id: "notif-1",
      data: {
        jobId: "job-123",
        applicationId: "application-456",
      },
    };

    expect(getNotificationDestination(notification, "admin")).toBe(
      "/admin/jobs/job-123/applications?id=application-456",
    );
  });

  it("routes interview-ready user notifications to the interview page", () => {
    const notification = {
      type: "application_status_changed",
      title: "Interview Ready",
      message: "Your application has moved to the interview stage.",
      data: {
        applicationId: "application-456",
      },
    };

    expect(getNotificationDestination(notification, "user")).toBe(
      "/applications/application-456/interview",
    );
  });

  it("routes user application notifications to my applications by default", () => {
    const notification = {
      type: "application_submitted",
      data: {
        applicationId: "application-456",
      },
    };

    expect(getNotificationDestination(notification, "user")).toBe("/my-applications");
  });

  it("returns the job page for job-based user notifications", () => {
    const notification = {
      type: "job_expiring",
      data: {
        jobId: "job-123",
      },
    };

    expect(getNotificationDestination(notification, "user")).toBe("/jobs/job-123");
  });

  it("supports notification id and read-state helpers across payload shapes", () => {
    expect(getNotificationId({ _id: "mongo-id" })).toBe("mongo-id");
    expect(getNotificationId({ id: "plain-id" })).toBe("plain-id");
    expect(isNotificationRead({ read: true })).toBe(true);
    expect(isNotificationRead({ isRead: true })).toBe(true);
    expect(isNotificationRead({ read: false })).toBe(false);
  });
});
