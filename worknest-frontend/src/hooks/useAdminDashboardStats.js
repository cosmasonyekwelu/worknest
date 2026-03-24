import { useQuery } from "@tanstack/react-query";
import { getAllJobs } from "@/api/api";
import { getApplicationsOverview } from "@/api/applications";
import { useAuth } from "@/store";

const parseNonNegativeNumber = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined || value === "") {
      continue;
    }

    const parsedValue = Number(value);
    if (Number.isFinite(parsedValue) && parsedValue >= 0) {
      return parsedValue;
    }
  }

  return null;
};

const extractJobItems = (response) => {
  const body = response?.data;
  const candidates = [
    body?.data?.data,
    body?.data?.jobs,
    body?.data?.items,
    body?.jobs,
    body?.items,
    body?.data,
    body,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }

    if (Array.isArray(candidate?.data)) {
      return candidate.data;
    }

    if (Array.isArray(candidate?.jobs)) {
      return candidate.jobs;
    }

    if (Array.isArray(candidate?.items)) {
      return candidate.items;
    }
  }

  return [];
};

const extractTotalJobs = (response) => {
  const body = response?.data;
  const totalJobs = parseNonNegativeNumber(
    body?.data?.totalJobs,
    body?.data?.total,
    body?.totalJobs,
    body?.total,
    body?.pagination?.totalJobs,
    body?.pagination?.total,
    body?.data?.pagination?.totalJobs,
    body?.data?.pagination?.total,
  );

  if (totalJobs !== null) {
    return totalJobs;
  }

  return extractJobItems(response).length;
};

const extractOverviewPayload = (response) => {
  const body = response?.data;
  const candidates = [body?.data?.data, body?.data, body];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") {
      continue;
    }

    if (
      parseNonNegativeNumber(candidate?.total, candidate?.totals?.all) !== null ||
      Array.isArray(candidate?.byStatus)
    ) {
      return candidate;
    }
  }

  return {};
};

const extractByStatus = (response, overviewPayload) => {
  const candidates = [
    overviewPayload?.byStatus,
    response?.data?.data?.byStatus,
    response?.data?.byStatus,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
};

const findStatusCount = (byStatus, targetStatus) => {
  const normalizedTarget = String(targetStatus || "").toLowerCase();
  const match = byStatus.find(
    (item) =>
      String(item?.status || item?.name || "").toLowerCase() === normalizedTarget,
  );

  if (!match) {
    return null;
  }

  return parseNonNegativeNumber(match?.count, match?.total, match?.value) ?? 0;
};

export function useAdminDashboardStats() {
  const { accessToken } = useAuth();

  const query = useQuery({
    queryKey: ["admin-dashboard-stats", accessToken],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const [allJobsResponse, activeJobsResponse, overviewResponse] = await Promise.all([
        getAllJobs({ page: 1, limit: 1 }, accessToken),
        getAllJobs({ page: 1, limit: 1, status: "active" }, accessToken),
        getApplicationsOverview(accessToken),
      ]);

      const totalJobs = extractTotalJobs(allJobsResponse);
      const activeJobs = extractTotalJobs(activeJobsResponse);

      const overviewPayload = extractOverviewPayload(overviewResponse);
      const totalApplications =
        parseNonNegativeNumber(
          overviewPayload?.total,
          overviewPayload?.totals?.all,
          overviewResponse?.data?.data?.total,
          overviewResponse?.data?.total,
        ) ?? 0;

      const byStatus = extractByStatus(overviewResponse, overviewPayload);
      const pendingReview =
        findStatusCount(byStatus, "in_review") ??
        findStatusCount(byStatus, "submitted") ??
        0;

      return {
        totalJobs,
        activeJobs,
        totalApplications,
        pendingReview,
      };
    },
  });

  return {
    totalJobs: query.data?.totalJobs ?? 0,
    activeJobs: query.data?.activeJobs ?? 0,
    totalApplications: query.data?.totalApplications ?? 0,
    pendingReview: query.data?.pendingReview ?? 0,
    isLoading: query.isLoading,
    error: query.error,
  };
}
