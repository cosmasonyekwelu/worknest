import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import PageWrapper from "@/components/PageWrapper";
import Search from "@/components/Search";
import Pagination from "@/components/common/Pagination";
import { ADMIN_PAGE_SIZE, getSafePageNumber } from "@/constants/pagination";
import ApplicationCard from "@/features/AdminApplication/ApplicationCard";
import ApplicationDetail from "@/features/AdminApplication/ApplicationDetail";
import Filter from "@/features/AdminApplication/Filter";
import Table from "@/features/AdminApplication/Table";
import { useAdminApplications } from "@/hooks/useApplications";
import { normalizeApplicationStatus } from "@/utils/constant";
import { getJobById } from "@/api/api";
import { useAuth } from "@/store";
import { Grid3x3, List, Loader2, ArrowLeft } from "lucide-react";
import { useSearchParams } from "react-router";

const AdminJobApplications = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const rawStatusFilter = searchParams.get("status") || "";
  const statusFilter = normalizeApplicationStatus(rawStatusFilter);
  const searchQuery = searchParams.get("query") || "";
  const page = getSafePageNumber(searchParams.get("page"));

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    let hasChanges = false;

    if (params.get("page") !== String(page)) {
      params.set("page", String(page));
      hasChanges = true;
    }

    if (params.get("limit") !== String(ADMIN_PAGE_SIZE)) {
      params.set("limit", String(ADMIN_PAGE_SIZE));
      hasChanges = true;
    }

    if (rawStatusFilter && rawStatusFilter !== statusFilter) {
      if (statusFilter) {
        params.set("status", statusFilter);
      } else {
        params.delete("status");
      }
      hasChanges = true;
    }

    if (hasChanges) {
      setSearchParams(params, { replace: true });
    }
  }, [page, rawStatusFilter, searchParams, setSearchParams, statusFilter]);

  // Fetch job details for display
  const { data: job } = useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const res = await getJobById(jobId, accessToken);
      return res.data?.data || res.data;
    },
    enabled: !!jobId && !!accessToken,
  });

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminApplications({
    jobId, // Filter by this job
    status: statusFilter,
    keyword: searchQuery,
    page,
  });

  const applications = response?.items || response?.data || [];
  const total = response?.total || 0;
  const totalPages = response?.totalPages || 1;

  const [viewMode, setViewMode] = useState("grid");
  const errorMessage =
    error?.response?.data?.message || "Failed to load applications.";

  const applicationId = searchParams.get("id");
  const handleBackFromDetails = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("id");
    setSearchParams(params);
  };

  if (applicationId) {
    return (
      <div className="pb-24">
        <ApplicationDetail
          applicationId={applicationId}
          onBack={handleBackFromDetails}
        />
      </div>
    );
  }

  const handleApplicationClick = (id) => {
    const params = new URLSearchParams(searchParams);
    params.set("id", id);
    navigate(`?${params.toString()}`);
  };

  const handleBack = () => {
    navigate(`/admin/jobs/${jobId}`);
  };

  const handlePageChange = (nextPage) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    params.set("limit", String(ADMIN_PAGE_SIZE));
    setSearchParams(params);
  };

  return (
    <PageWrapper>
      {/* Back button and title */}
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-500 hover:text-black mb-4 transition-all group font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-black" />
          <span>Back to Job Details</span>
        </button>
        <h1 className="text-2xl font-bold">
          Applications for {job?.title || "Job"}
        </h1>
        <p className="mt-2 text-gray-600">
          {total} applications received for this position
        </p>
      </div>

      {/* Search + Filters + View Toggle */}
      <div className="mt-6">
        <Search minQueryLength={1}>
          <div className="hidden md:flex flex-col md:flex-row gap-2 mt-3 md:mt-0">
            <Filter />
          </div>
          {/* View Mode Toggle */}
          <div className="hidden md:flex mt-2 md:mt-0 items-center gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-orange-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              title="Grid View"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-orange-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </Search>
      </div>

      {/* Applications Grid or Table */}
      <div className="mt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="animate-spin text-[#F57450]" size={40} />
            <p className="text-gray-500 font-medium">Loading applications...</p>
          </div>
        ) : isError ? (
          <div className="bg-white rounded-xl p-8 sm:p-12 text-center space-y-4">
            <p className="text-red-600 font-medium">{errorMessage}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Try Again
            </button>
          </div>
        ) : applications.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {applications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onClick={() => handleApplicationClick(application.id)}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[700px] bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <Table applications={applications} />
              </div>
            </div>
          )
        ) : (
          <div className="bg-white rounded-xl p-8 sm:p-12 text-center">
            <p className="text-gray-500">No applications found for this job.</p>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600 mt-6 flex justify-between items-center">
        <span>
          Showing {applications.length} of {total} applications
        </span>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        isLoading={isLoading}
        onPageChange={handlePageChange}
      />
    </PageWrapper>
  );
};

export default AdminJobApplications;
