import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useJobs } from "@/hooks/useJobs";
import { getSavedJobs } from "@/api/api";
import { useAuth } from "@/store";
import { useQuery } from "@tanstack/react-query";
import JobCard from "@/components/JobCard";
import { Search, MapPin, Filter, X } from "lucide-react";

const JOB_TYPE_OPTIONS = [
  "Full-Time",
  "Contract",
  "Part-Time",
  "Internship",
  "Freelance",
];

const CATEGORY_OPTIONS = [
  "Development",
  "Design",
  "Product Management",
  "Writing",
  "Advertising/PR",
  "Health & Fitness",
  "Data & Analytics",
  "Media & Communication",
  "Entertainment",
  
];

const SALARY_OPTIONS = [
  { label: "₦300k - ₦380k", min: 300000, max: 380000 },
  { label: "₦250k - ₦350k", min: 250000, max: 350000 },
  { label: "₦200k - ₦250k", min: 200000, max: 250000 },
  { label: "₦150k - ₦250k", min: 150000, max: 250000 },
  { label: "₦100k - ₦150k", min: 100000, max: 150000 },
];

const parsePositiveInteger = (value, fallback) => {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
};

export default function Jobs() {
  const { accessToken } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const pageFromUrl = parsePositiveInteger(searchParams.get("page"), 1);
  const selectedJobType = searchParams.get("jobType");
  const selectedCategory = searchParams.get("category") || searchParams.get("industry");
  const locationFilterValue = (searchParams.get("location") || "").trim();
  const salaryMinFromUrl = parsePositiveInteger(searchParams.get("salaryMin"), null);
  const salaryMaxFromUrl = parsePositiveInteger(searchParams.get("salaryMax"), null);

  // Derived filters from URL - Single source of truth
  const filters = {
    jobType: selectedJobType ? [selectedJobType] : [],
    category: selectedCategory ? [selectedCategory] : [],
    salaryMin: salaryMinFromUrl,
    salaryMax: salaryMaxFromUrl,
    keyword: searchParams.get("keyword") || searchParams.get("search") || "",
    location: searchParams.get("location") || "",
    page: pageFromUrl,
    limit: locationFilterValue ? 50 : 10,
  };

  // Local state only for the input field values to allow typing before searching
  const [searchInputs, setSearchInputs] = useState({
    keyword: filters.keyword,
    location: filters.location,
  });

  // Sync state with URL only when URL changes (e.g. Back button)
  // This follows the React pattern for 'Get derived state from props' without useEffect
  const [prevUrlFilters, setPrevUrlFilters] = useState({
    keyword: filters.keyword,
    location: filters.location,
  });
  if (
    filters.keyword !== prevUrlFilters.keyword ||
    filters.location !== prevUrlFilters.location
  ) {
    setSearchInputs({ keyword: filters.keyword, location: filters.location });
    setPrevUrlFilters({
      keyword: filters.keyword,
      location: filters.location,
    });
  }

  const { data: jobResponse, isLoading } = useJobs(filters);

  const fetchedJobs = jobResponse?.items || [];
  const normalizedLocationFilter = filters.location.trim().toLowerCase();
  const finalJobs = normalizedLocationFilter
    ? fetchedJobs.filter((job) =>
        String(job?.location || "")
          .toLowerCase()
          .includes(normalizedLocationFilter),
      )
    : fetchedJobs;
  const totalJobs = normalizedLocationFilter
    ? finalJobs.length
    : jobResponse?.total || 0;
  const totalPages = Math.max(1, jobResponse?.totalPages || 1);
  const currentPage = jobResponse?.page || filters.page;

  const { data: savedJobsResponse } = useQuery({
    queryKey: ["savedJobs", accessToken],
    queryFn: async () => {
      if (!accessToken) return [];
      let page = 1;
      const limit = 50;
      let totalPages = 1;
      const allSavedJobs = [];

      while (page <= totalPages) {
        const res = await getSavedJobs(accessToken, { page, limit });
        if (res.status !== 200) {
          break;
        }

        const currentPageItems = Array.isArray(res.data?.data) ? res.data.data : [];
        allSavedJobs.push(...currentPageItems);
        totalPages = parsePositiveInteger(res.data?.totalPages, 1);
        page += 1;
      }

      return allSavedJobs;
    },
    enabled: !!accessToken,
  });

  const savedJobIds = new Set(
    Array.isArray(savedJobsResponse)
      ? savedJobsResponse.map((j) => j._id || j.id)
      : [],
  );

  const toggleSingleFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    const selected = newParams.get(key);
    const isSelected = selected === value;
    if (isSelected) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    if (key === "category") {
      newParams.delete("industry");
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handleTypeChange = (value) => toggleSingleFilter("jobType", value);
  const handleCategoryChange = (value) => toggleSingleFilter("category", value);

  const handleSalaryChange = (range) => {
    const newParams = new URLSearchParams(searchParams);
    const isSelected =
      salaryMinFromUrl === range.min && salaryMaxFromUrl === range.max;

    if (isSelected) {
      newParams.delete("salaryMin");
      newParams.delete("salaryMax");
    } else {
      newParams.set("salaryMin", String(range.min));
      newParams.set("salaryMax", String(range.max));
    }

    newParams.delete("salaryRange");
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handleSearch = () => {
    const newParams = new URLSearchParams(searchParams);

    if (searchInputs.keyword.trim()) {
      newParams.set("keyword", searchInputs.keyword.trim());
    } else {
      newParams.delete("keyword");
    }
    newParams.delete("search");

    if (searchInputs.location.trim()) {
      newParams.set("location", searchInputs.location.trim());
    } else {
      newParams.delete("location");
    }

    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
  };

  // No early return for loading to preserve layout
  // if (isLoading) return ... (REMOVED)

  return (
    <div className="flex flex-col gap-12">
      {/* Mobile/Tablet Filter Drawer Overlay */}
      {showMobileFilters && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowMobileFilters(false)}
        />
      )}

      <div className="w-auto py-3 md:py-16 bg-[#F8E0E1]">
        <div className="container mx-auto px-4 flex flex-col">
          <div className="bg-[#fcedea] text-[#F57450] px-4 py-1.5 rounded-full text-xs w-fit font-bold uppercase  mb-8">
            Browse Opportunities
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0A0A0A] mb-4 max tracking-tight leading-tight">
            Find a role that matches your ambition
          </h1>

          <p className="text-gray-600 text-start text-lg md:text-xl mb-12 max-w-2xl font-medium">
            Search thousands of curated openings across industries, experience
            levels, and locations.
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-4xl flex flex-col md:flex-row gap-4 bg-transparent p-2">
            <div className="relative flex-1 w-full">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Job title, skills or keyboard"
                value={searchInputs.keyword}
                onChange={(e) =>
                  setSearchInputs({ ...searchInputs, keyword: e.target.value })
                }
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#F57450]/10 focus:border-[#F57450]/30 transition-all text-sm shadow-sm"
              />
            </div>

            <div className="relative flex-1 w-full">
              <MapPin
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Location"
                value={searchInputs.location}
                onChange={(e) =>
                  setSearchInputs({ ...searchInputs, location: e.target.value })
                }
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#F57450]/10 focus:border-[#F57450]/30 transition-all text-sm shadow-sm"
              />
            </div>

            <button
              type="button"
              onClick={handleSearch}
              className="w-full md:w-auto px-10 py-4 bg-[#F57450] text-white font-bold rounded-xl hover:bg-[#E06440] transition-all shadow-lg shadow-[#F57450]/20 whitespace-nowrap"
            >
              Search Job
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 pb-16 relative">
        {/* Toggle Filter Button (Visible on Mobile/Tablet) */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <Filter size={20} />
            <span>Filters</span>
          </button>
        </div>

        {/* FILTERS SIDEBAR */}
        <aside
          className={`
            bg-white p-6 rounded-xl space-y-6 border border-gray-100 shadow-sm h-fit overflow-y-auto
            lg:block lg:static lg:w-auto lg:h-fit lg:z-0 lg:shadow-sm lg:translate-x-0
            fixed inset-y-0 left-0 z-50 w-[300px] shadow-2xl transform transition-transform duration-300 ease-in-out
            ${showMobileFilters ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <div className="flex items-center justify-between lg:hidden mb-2">
            <h3 className="font-bold text-xl text-gray-900">Filters</h3>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="p-2 text-gray-500 hover:text-[#F57450]"
            >
              <X size={24} />
            </button>
          </div>

          {/* JOB TYPE */}
          <div className="space-y-4 border-2 border-gray-50 p-5 rounded-2xl">
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
              Job Type
            </h3>
            {JOB_TYPE_OPTIONS.map((type) => (
              <label
                key={type}
                className="flex items-center gap-3 cursor-pointer group hover:text-[#F57450] transition-colors mb-3 last:mb-0"
              >
                <input
                  type="checkbox"
                  checked={filters.jobType.includes(type)}
                  onChange={() => handleTypeChange(type)}
                  className="w-4 h-4 rounded border-gray-300 text-[#F57450] focus:ring-[#F57450]"
                />
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                  {type}
                </span>
              </label>
            ))}
          </div>

          {/* INDUSTRY */}
          <div className="space-y-4 border-2 border-gray-50 p-5 rounded-2xl">
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
              Industry
            </h3>
            {CATEGORY_OPTIONS.map((category) => (
              <label
                key={category}
                className="flex items-center gap-3 cursor-pointer group hover:text-[#F57450] transition-colors mb-3 last:mb-0"
              >
                <input
                  type="checkbox"
                  checked={filters.category.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                  className="w-4 h-4 rounded border-gray-300 text-[#F57450] focus:ring-[#F57450]"
                />
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                  {category}
                </span>
              </label>
            ))}
          </div>

          {/* SALARY */}
          <div className="space-y-4 border-2 border-gray-50 p-5 rounded-2xl">
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
              Salary Range
            </h3>
            {SALARY_OPTIONS.map((salary) => (
              <label
                key={salary.label}
                className="flex items-center gap-3 cursor-pointer group hover:text-[#F57450] transition-colors mb-3 last:mb-0"
              >
                <input
                  type="checkbox"
                  checked={
                    salaryMinFromUrl === salary.min && salaryMaxFromUrl === salary.max
                  }
                  onChange={() => handleSalaryChange(salary)}
                  className="w-4 h-4 rounded border-gray-300 text-[#F57450] focus:ring-[#F57450]"
                />
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                  {salary.label}
                </span>
              </label>
            ))}
          </div>
        </aside>

        {/* JOB LIST */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-2">
            <p className="text-gray-600 font-medium">
              Showing{" "}
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-[#F57450] border-t-transparent rounded-full animate-spin ml-2 align-middle"></span>
              ) : (
                <>
                  <span className="text-[#F57450] font-bold">
                    {finalJobs.length}
                  </span>{" "}
                  of{" "}
                  <span className="text-[#F57450] font-bold">
                    {totalJobs}
                  </span>{" "}
                </>
              )}
              curated opportunities
            </p>
          </div>

          <div className="min-h-[400px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-[#F57450] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">
                  Updating opportunities...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {finalJobs.length === 0 && (
                  <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-100">
                    <p className="text-gray-400 text-lg">
                      No jobs found matching your criteria.
                    </p>
                  </div>
                )}

                {finalJobs.map((job) => (
                  <JobCard
                    key={job._id || job.id}
                    job={job}
                    isSavedInitial={savedJobIds.has(job._id || job.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* PAGINATION UI */}
          {/* Only show pagination if NOT loading and we have pages */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8 pb-8">
              <button
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-6 py-2 border border-gray-200 rounded-lg font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <span className="text-sm font-bold text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-6 py-2 bg-[#F57450] text-white rounded-lg font-bold hover:bg-[#E06440] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#F57450]/20"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
  );
}
