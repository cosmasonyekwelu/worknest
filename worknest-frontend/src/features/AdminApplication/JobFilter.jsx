import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import React, { useMemo } from "react";
import { useSearchParams } from "react-router";
import { getAllJobs } from "@/api/api";
import { ADMIN_PAGE_SIZE } from "@/constants/pagination";
import { useAuth } from "@/store";

const extractJobItems = (responseBody) => {
  if (Array.isArray(responseBody?.data?.data)) {
    return responseBody.data.data;
  }

  if (Array.isArray(responseBody?.data)) {
    return responseBody.data;
  }

  if (Array.isArray(responseBody?.jobs)) {
    return responseBody.jobs;
  }

  if (Array.isArray(responseBody)) {
    return responseBody;
  }

  return [];
};

export default function JobFilter({ applications = [] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { accessToken } = useAuth();

  const selectedJob = searchParams.get("job") || "";

  const { data: jobsFromApi = [], isLoading: isLoadingJobs } = useQuery({
    queryKey: ["admin-application-job-filter-options"],
    queryFn: async () => {
      const response = await getAllJobs({ page: 1, limit: 200 }, accessToken);
      const jobs = extractJobItems(response?.data);

      return jobs
        .map((job) => ({
          id: job?._id || job?.id,
          title: job?.title,
        }))
        .filter((job) => Boolean(job.id) && Boolean(job.title));
    },
    enabled: !!accessToken,
    staleTime: 60000,
  });

  const jobsFromApplications = useMemo(() => {
    return applications
      .map((application) => ({
        id: application?.job?.id,
        title: application?.job?.title,
      }))
      .filter((job) => Boolean(job.id) && Boolean(job.title));
  }, [applications]);

  const uniqueJobs = useMemo(() => {
    const jobsMap = new Map();
    [...jobsFromApi, ...jobsFromApplications].forEach((job) => {
      if (!jobsMap.has(job.id)) {
        jobsMap.set(job.id, job.title);
      }
    });

    return Array.from(jobsMap, ([id, title]) => ({ id, title }));
  }, [jobsFromApi, jobsFromApplications]);

  const handleJobChange = (e) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams);

    if (!value) {
      params.delete("job");
    } else {
      params.set("job", value);
    }

    params.set("page", "1");
    params.set("limit", String(ADMIN_PAGE_SIZE));
    setSearchParams(params);
  };

  return (
    <div className="relative">
      <select
        value={selectedJob}
        onChange={handleJobChange}
        className="appearance-none px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white cursor-pointer"
      >
        <option value="">
          {isLoadingJobs && uniqueJobs.length === 0 ? "Loading jobs..." : "All Jobs"}
        </option>
        {selectedJob && !uniqueJobs.some((job) => job.id === selectedJob) && (
          <option value={selectedJob}>Selected job</option>
        )}
        {uniqueJobs.map((job) => (
          <option key={job.id} value={job.id}>
            {job.title}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
    </div>
  );
}
