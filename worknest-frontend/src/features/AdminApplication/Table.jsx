import { useCallback } from "react";
import { Eye } from "lucide-react";
import { applicationColumns, getStatusStyles } from "@/utils/constant";
import TableBody from "@/components/TableBody";
import { Link, useLocation } from "react-router";

export default function Table({ applications }) {
  const location = useLocation();

  const renderCell = useCallback(
    (row, columnKey) => {
      const params = new URLSearchParams(location.search);
      params.set("id", row.id);

      switch (columnKey) {
        case "applicantName": {
          const applicantName = row.applicant?.name || "-";
          const applicantEmail = row.applicant?.email || "-";

          return (
            <div className="flex flex-col py-2">
              <span
                className="block max-w-[180px] truncate font-bold text-gray-900 group-hover:text-[#F57450] transition-colors"
                title={applicantName}
              >
                {applicantName}
              </span>
              <span
                className="block max-w-[220px] truncate text-gray-400 text-xs font-medium"
                title={applicantEmail}
              >
                {applicantEmail}
              </span>
            </div>
          );
        }

        case "jobTitle": {
          const jobTitle = row.job?.title || "-";

          return (
            <div
              className="block max-w-[220px] truncate font-semibold text-gray-800 text-sm"
              title={jobTitle}
            >
              {jobTitle}
            </div>
          );
        }

        case "appliedDate":
          return (
            <div className="text-gray-500 font-medium text-sm">
              {new Date(row.createdAt).toLocaleDateString("en-GB")}
            </div>
          );

        case "status":
          return (
            <div className="flex">
              <span
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase shadow-sm ${getStatusStyles(
                  row.status,
                )}`}
              >
                {row.status}
              </span>
            </div>
          );

        case "action":
          return (
            <Link
              to={`?${params.toString()}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-900 hover:bg-gray-50 font-bold text-sm transition-all group whitespace-nowrap"
            >
              <Eye
                size={18}
                className="text-gray-400 group-hover:text-[#F57450] transition-colors"
              />
              <span>View</span>
            </Link>
          );

        default:
          return <span className="text-gray-700">{row[columnKey]}</span>;
      }
    },
    [location.search],
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <TableBody
        tableColumns={applicationColumns}
        tableData={applications}
        renderCell={renderCell}
      />
    </div>
  );
}
