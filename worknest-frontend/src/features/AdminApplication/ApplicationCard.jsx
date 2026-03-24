import { Calendar, Building2 } from "lucide-react";
import { getStatusStyles } from "@/utils/constant";

export default function ApplicationCard({ application, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[#F57450] transition-colors truncate">
            {application.applicant?.name}
          </h3>
          <p className="text-sm text-gray-500 font-bold truncate">
            {application.job?.title}
          </p>
        </div>
        <span
          className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-sm ${getStatusStyles(
            application.status,
          )}`}
        >
          {application.status}
        </span>
      </div>

      <div className="space-y-3 text-sm text-gray-500 font-medium">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span className="truncate">{application.job?.companyName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>
            Applied{" "}
            {new Date(application.createdAt).toLocaleDateString("en-GB")}
          </span>
        </div>
      </div>
    </div>
  );
}
