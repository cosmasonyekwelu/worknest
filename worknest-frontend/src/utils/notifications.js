export const getNotificationId = (notification) =>
  notification?._id || notification?.id || "";

export const isNotificationRead = (notification) =>
  notification?.read === true || notification?.isRead === true;

const isInterviewNotification = (notification) =>
  /interview/i.test(`${notification?.title || ""} ${notification?.message || ""}`);

export const getNotificationDestination = (notification, audience = "user") => {
  const jobId = notification?.data?.jobId;
  const applicationId = notification?.data?.applicationId;

  if (audience === "admin") {
    if (jobId && applicationId) {
      return `/admin/jobs/${jobId}/applications?id=${applicationId}`;
    }

    if (applicationId) {
      return `/admin/applications?id=${applicationId}`;
    }

    if (jobId) {
      return `/admin/jobs/${jobId}`;
    }

    return null;
  }

  if (applicationId && isInterviewNotification(notification)) {
    return `/applications/${applicationId}/interview`;
  }

  if (notification?.type === "job_expiring" && jobId) {
    return `/jobs/${jobId}`;
  }

  if (
    applicationId ||
    notification?.type === "application_submitted" ||
    notification?.type === "application_status_changed"
  ) {
    return "/my-applications";
  }

  if (jobId) {
    return `/jobs/${jobId}`;
  }

  return null;
};
