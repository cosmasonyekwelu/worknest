import { Link } from "react-router";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/store";
import { saveJob, unsaveJob } from "@/api/api";
import { toast } from "sonner";
import Avatar from "@/components/Avatar";

export default function JobCard({ job, isSavedInitial = false, onToggleSave }) {
  const { accessToken } = useAuth();
  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const [loading, setLoading] = useState(false);

  const handleSaveToggle = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!accessToken) {
      toast.error("Please login to save jobs");
      return;
    }

    setLoading(true);

    try {
      if (isSaved) {
        await unsaveJob(job._id || job.id, accessToken);
        toast.success("Job removed from saved");
        setIsSaved(false);
      } else {
        await saveJob(job._id || job.id, accessToken);
        toast.success("Job saved successfully");
        setIsSaved(true);
      }

      if (onToggleSave) {
        onToggleSave();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update save status",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link
      to={`/jobs/${job._id || job.id}`}
      className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition block relative"
    >
      <div className="flex justify-between items-start mb-3">
        <span className="inline-block bg-orange-100 text-xs px-3 py-1 rounded-full">
          {job.jobType}
        </span>
        <button
          type="button"
          onClick={handleSaveToggle}
          disabled={loading}
          aria-label={isSaved ? "Remove saved job" : "Save job"}
          className="rounded-full border border-gray-200 p-2 text-gray-600 transition hover:border-orange-200 hover:text-[#F75D1F] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isSaved ? (
            <BookmarkCheck className="h-4 w-4 text-[#F75D1F]" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </button>
      </div>

      <h4 className="font-semibold text-lg mb-1">{job.title}</h4>

      <p className="text-sm mb-2">
        Salary: NGN {job.salaryRange?.min} - NGN {job.salaryRange?.max}
      </p>

      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
        {job.jobDescription}
      </p>
      <hr className="my-4 border-gray-200" />

      <div className="w-fit flex space-x-2">
        <div>
          <Avatar
            src={job.companyLogo?.url || job.companyLogo}
            name={job.companyName}
            alt={job.companyName}
            size={32}
            className="w-8 h-8 object-contain"
          />
        </div>
        <div>
          <div className="justify-between text-xs text-gray-500">
            <span>
              {job.companyName}, {job.location}
            </span>
          </div>

          <div className="text-xs text-gray-500">
            <span>
              {job.createdAt
                ? new Date(job.createdAt).toLocaleDateString("en-GB")
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
