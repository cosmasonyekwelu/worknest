import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSavedJobs } from "@/api/api";
import { useAuth } from "@/store";
import SavedJobItem from "@/components/SavedJobItem";

export default function MySavedJobs() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSavedJobs, setTotalSavedJobs] = useState(0);
  const LIMIT = 10;

  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await getSavedJobs(accessToken, { page, limit: LIMIT });
        if (res.status === 200) {
          const payload = res.data?.data ?? {};
          const items = Array.isArray(payload.jobs) ? payload.jobs : [];
          setSavedJobs(items);
          setTotalSavedJobs(Number(payload.total) || 0);
          setTotalPages(Math.max(1, Number(payload.totalPages) || 1));
        }
      } catch (error) {
        console.error("Error fetching saved jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, [accessToken, page]);

  const handleBack = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0EEEE] flex items-center justify-center">
        <div className="text-gray-600 font-semibold">
          Loading your saved jobs...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-10">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>

          <div className="mb-2">
            <h1 className="text-3xl sm:text-4xl font-black text-black mb-1">
              My saved Jobs
            </h1>
            <p className="text-lg text-gray-500 font-medium">
              You have saved {totalSavedJobs}{" "}
              {totalSavedJobs === 1 ? "job" : "jobs"}
            </p>
          </div>
        </div>

        {/* Jobs List */}
        <div className="flex flex-col gap-4">
          {savedJobs.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
              <p className="text-gray-400 text-lg font-medium">
                No saved jobs yet. Start exploring!
              </p>
            </div>
          ) : (
            savedJobs.map((job) => (
              <SavedJobItem key={job._id || job.id} job={job} />
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="px-5 py-2 border border-gray-200 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm font-semibold text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              className="px-5 py-2 border border-gray-200 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
