import { Link } from "react-router";
import { ArrowRight, Briefcase, FileText, Clock } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import CircularProgress from "@/components/dashboard/CircularProgress";
import { useAdminDashboardStats } from "@/hooks/useAdminDashboardStats";
import { useAdminApplications, useApplicationStats } from "@/hooks/useApplications";
import { getStatusStyles, normalizeApplicationStatus } from "@/utils/constant";

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

const extractApplicationsArray = (payload) => {
  const candidates = [
    payload?.items,
    payload?.data,
    payload?.data?.data,
    payload?.data?.data?.data,
    payload,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }

    if (Array.isArray(candidate?.items)) {
      return candidate.items;
    }

    if (Array.isArray(candidate?.data)) {
      return candidate.data;
    }
  }

  return [];
};

const extractOverviewPayload = (payload) => {
  const candidates = [payload?.data?.data, payload?.data, payload];

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

const formatStatusLabel = (statusValue) => {
  const normalizedStatus = normalizeApplicationStatus(statusValue || "submitted");
  return normalizedStatus
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getTimestamp = (value) => {
  const parsedTime = new Date(value).getTime();
  return Number.isFinite(parsedTime) ? parsedTime : 0;
};

const getStatusCountMap = (byStatus = []) => {
  return byStatus.reduce((acc, item) => {
    const normalizedStatus = normalizeApplicationStatus(item?.status || item?.name);
    if (!normalizedStatus) {
      return acc;
    }

    const count = parseNonNegativeNumber(item?.count, item?.total, item?.value) ?? 0;
    acc[normalizedStatus] = count;
    return acc;
  }, {});
};

const toPercentage = (part, total) => {
  if (!total) {
    return 0;
  }

  return Math.round((part / total) * 100);
};

const DashboardHome = () => {
  const {
    totalJobs,
    activeJobs,
    totalApplications,
    pendingReview,
    isLoading,
  } = useAdminDashboardStats();

  const { data: applicationsResponse } = useAdminApplications({
    page: 1,
    status: "",
    jobId: "",
    keyword: "",
    startDate: "",
    endDate: "",
  });

  const { data: overviewStatsResponse } = useApplicationStats();

  const toDisplayValue = (value) => (isLoading ? "..." : String(value ?? 0));

  const dashboardStats = [
    {
      key: "total-jobs",
      label: "Total Jobs",
      value: toDisplayValue(totalJobs),
      icon: Briefcase,
      color: "bg-[#1B294B]/10 text-gray-600",
    },
    {
      key: "active-jobs",
      label: "Active Jobs",
      value: toDisplayValue(activeJobs),
      icon: Briefcase,
      color: "bg-green-50 text-green-600",
    },
    {
      key: "total-applications",
      label: "Total Applications",
      value: toDisplayValue(totalApplications),
      icon: FileText,
      color: "bg-blue-50 text-blue-600",
    },
    {
      key: "pending-review",
      label: "Pending Review",
      value: toDisplayValue(pendingReview),
      icon: Clock,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  const applications = extractApplicationsArray(applicationsResponse);
  const recentApplications = [...applications]
    .sort((a, b) => getTimestamp(b?.createdAt) - getTimestamp(a?.createdAt))
    .slice(0, 5);

  const overviewPayload = extractOverviewPayload(overviewStatsResponse);
  const totalOverviewApplications =
    parseNonNegativeNumber(
      overviewPayload?.total,
      overviewPayload?.totals?.all,
      overviewStatsResponse?.data?.data?.total,
      overviewStatsResponse?.data?.total,
    ) ?? 0;

  const byStatus = Array.isArray(overviewPayload?.byStatus)
    ? overviewPayload.byStatus
    : Array.isArray(overviewStatsResponse?.data?.data?.byStatus)
      ? overviewStatsResponse.data.data.byStatus
      : Array.isArray(overviewStatsResponse?.data?.byStatus)
        ? overviewStatsResponse.data.byStatus
        : [];

  const statusCountMap = getStatusCountMap(byStatus);
  const submittedCount = statusCountMap.submitted ?? 0;
  const reviewedCount = Math.max(totalOverviewApplications - submittedCount, 0);
  const shortlistedCount = statusCountMap.shortlisted ?? 0;
  const rejectedCount = statusCountMap.rejected ?? 0;

  const overviewCards = [
    {
      key: "reviewed",
      label: "Applications Reviewed",
      value: toPercentage(reviewedCount, totalOverviewApplications),
      color: "stroke-green-500",
      textColor: "text-gray-600",
    },
    {
      key: "shortlisted",
      label: "Candidated Shortlisted",
      value: toPercentage(shortlistedCount, totalOverviewApplications),
      color: "stroke-orange-500",
      textColor: "text-gray-600",
    },
    {
      key: "rejected",
      label: "Applications Rejected",
      value: toPercentage(rejectedCount, totalOverviewApplications),
      color: "stroke-red-500",
      textColor: "text-gray-600",
    },
  ];

  return (
    <div className="space-y-7">
      {/* header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-[24px] text-[#171717] font-bold">Dashboard</h1>
          <p className="text-[14px] text-gray-500">
            Welcome back! Here's an overview of your job portal.
          </p>
        </div>
        <Link
          to="/admin/jobs"
          className="bg-(--sidebar-active-color) text-white px-5 py-2.5 rounded-lg font-medium hover:bg-black/90 transition-all"
        >
          <span className="font-semibold text-[16px]">+ Create Job</span>
        </Link>
      </div>

      {/* stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat) => (
          <StatsCard
            key={stat.key}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg py-5 px-6 border border-[#7D7D7D]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-[16px] text-[#000000]">Recent Activity</h3>
            <Link to="/admin/applications" className="flex items-center gap-2">
              <span className="text-sm text-[#65758B]">View All</span>
              <ArrowRight className="text-[#65758B] w-5 h-5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentApplications.length > 0 ? (
              recentApplications.map((application, index) => {
                const statusValue = application?.status || "submitted";
                const normalizedStatus = normalizeApplicationStatus(statusValue);
                const statusLabel = formatStatusLabel(statusValue) || "Submitted";
                const jobTitle = application?.job?.title || "Unknown job";
                const appliedAt = application?.createdAt
                  ? new Date(application.createdAt).toLocaleString()
                  : "Unknown time";

                return (
                  <div
                    key={application?.id || application?._id || `${jobTitle}-${index}`}
                    className="flex justify-between items-center gap-3"
                  >
                    <div>
                      <p className="text-[16px] font-semibold text-[#0F1729]">
                        New application for {jobTitle}
                      </p>
                      <span className="text-[14px] text-[#65758B]">{appliedAt}</span>
                    </div>

                    <span
                      className={`text-[14px] font-semibold px-4 py-2 h-fit rounded-full ${getStatusStyles(
                        normalizedStatus,
                      )}`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-[14px] text-[#65758B]">No recent applications yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg p-5 border">
          <h3 className="font-medium mb-6 p-3 border-b border-[#CAD3DB]">
            Application Overview
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {overviewCards.map((item) => (
              <div key={item.key} className="flex flex-col items-center px-5">
                <p className="text-[14px] font-semibold text-[#525151] text-center">
                  {item.label}
                </p>
                <CircularProgress
                  value={item.value}
                  color={item.color}
                  textColor={item.textColor}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
