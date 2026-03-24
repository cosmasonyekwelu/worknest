import React from "react";
import { Building2, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Avatar from "@/components/Avatar"; // ✅ Import Avatar component

export default function SavedJobItem({ job }) {
  const navigate = useNavigate();

  const handleApply = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/apply/${job._id || job.id}`);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-6 w-full sm:w-auto">
        {/* Company Logo with fallback to initials */}
        <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 p-2">
          <Avatar
            src={job.companyLogo?.url || job.companyLogo} // handles object or string
            name={job.companyName}
            alt={job.companyName}
            size={48} // 16*3 = 48px (since w-16 h-16 is 64px, but inside p-2, the image is smaller)
            className="w-full h-full object-contain"
          />
        </div>

        {/* Job Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-bold text-gray-900 mb-2 truncate">
            {job.title}
          </h3>
          <div className="flex flex-wrap items-center gap-4 text-gray-500">
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-gray-400" />
              <span className="text-base font-medium">{job.companyName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-gray-400" />
              <span className="text-base font-medium">
                {job.createdAt
                  ? new Date(job.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <button
        onClick={handleApply}
        className="w-full sm:w-auto px-10 py-3 bg-[#F85E1E] hover:bg-[#E2541A] text-white font-semibold rounded-lg transition-colors text-lg"
      >
        Apply now
      </button>
    </div>
  );
}