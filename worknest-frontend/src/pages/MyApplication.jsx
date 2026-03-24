import React, { useState } from "react";
import { ArrowLeft, Search, Loader2, Building2, Calendar } from "lucide-react";
import { useNavigate } from "react-router";
import { useMyApplications } from "@/hooks/useApplications";
import { getStatusStyles, formatDate } from "@/utils/constant";
import Avatar from "@/components/Avatar"; // ✅ Import Avatar for company logo

export default function MyApplications() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Status");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: response, isLoading } = useMyApplications({ page, limit });

  const applications = response?.data || [];
  const totalApplications = response?.total || 0;
  const totalPages = response?.totalPages || 1;

  const handleBack = () => {
    navigate(-1);
  };

  const filteredApplications = applications.filter((app) => {
    const searchTermLower = searchTerm.toLowerCase();
    const jobTitle = app.job?.title || "";
    const companyName = app.job?.companyName || "";

    const matchesSearch = searchTerm
      ? jobTitle.toLowerCase().includes(searchTermLower) ||
        companyName.toLowerCase().includes(searchTermLower)
      : true;
    const matchesStatus =
      statusFilter === "Status" || !statusFilter || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="container max-w-5xl mx-auto px-4 py-4 md:py-12">
        {/* Header Section */}
        <div className="mb-10">
          <button
            onClick={handleBack}
            className="group flex items-center gap-2 text-gray-500 hover:text-black mb-8 transition-all"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              My Applications
            </h1>
            <p className="text-gray-500 font-medium">
              You have applied for{" "}
              <span className="text-gray-900">{totalApplications} jobs</span>
            </p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F57450]/20 focus:border-[#F57450] transition-all"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none w-full md:w-[160px] px-6 py-3.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F57450]/20 focus:border-[#F57450] cursor-pointer transition-all"
            >
              <option value="Status">Status</option>
              <option>submitted</option>
              <option>in_review</option>
              <option>shortlisted</option>
              <option>interview</option>
              <option>offer</option>
              <option>rejected</option>
              <option>hired</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <Loader2 className="animate-spin text-[#F57450]" size={40} />
              <p className="text-gray-400 font-medium">
                Loading applications...
              </p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                No applications found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            filteredApplications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-5 flex-1 min-w-0">
                    {/* Company Logo - ✅ Replaced with Avatar */}
                    <div className="w-14 h-14 rounded-2xl shrink-0 bg-white border border-gray-100 overflow-hidden group-hover:scale-105 transition-transform duration-300 shadow-sm">
                      <Avatar
                        src={app.job?.companyLogo?.url || app.job?.companyLogo}
                        name={app.job?.companyName}
                        alt={app.job?.companyName || "Company Logo"}
                        size={56} // matches w-14
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Job Details */}
                    <div className="min-w-0 space-y-1">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-[#F57450] transition-colors truncate">
                        {app.job?.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-5 text-gray-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Building2 size={16} />
                          <span className="text-sm">
                            {app.job?.companyName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={16} />
                          <span className="text-sm">
                            {formatDate(app.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0 flex items-center gap-3">
                    {app.status === "interview" && (
                      <button
                        onClick={() => navigate(`/applications/${app.id}/interview`)}
                        className="px-4 py-2 rounded-lg bg-[#F57450] text-white text-xs font-bold"
                      >
                        Take Interview
                      </button>
                    )}
                    <span
                      className={`px-5 py-2 rounded-full text-xs font-bold shadow-sm ${getStatusStyles(
                        app.status,
                      )}`}
                    >
                      {app.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12 gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setPage(i + 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`w-10 h-10 rounded-xl font-bold transition-all ${
                  page === i + 1
                    ? "bg-[#F57450] text-white shadow-lg shadow-[#F57450]/20"
                    : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}