import { useState, useRef, useEffect } from "react";
import { ChevronDown, Filter as FilterIcon } from "lucide-react";
import { useSearchParams } from "react-router";
import { ADMIN_PAGE_SIZE } from "@/constants/pagination";
import {
  normalizeApplicationStatus,
  statusConfig,
} from "@/utils/constant";

export default function Filter() {
  const [openOptions, setOpenOptions] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedStatus = normalizeApplicationStatus(
    searchParams.get("status") || "",
  );
  const [filters, setFilters] = useState({
    status: selectedStatus,
  });
  const dropdownRef = useRef(null);

  const statusOptions = [
    ...statusConfig,
    { label: "Viewed", value: "viewed" },
    { label: "Pending", value: "pending" },
  ].filter((status, index, statuses) => {
    return statuses.findIndex((item) => item.value === status.value) === index;
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const updatedSearchParams = new URLSearchParams(searchParams);
    const normalizedStatus = normalizeApplicationStatus(filters.status);
    if (normalizedStatus) {
      updatedSearchParams.set("status", normalizedStatus);
    } else {
      updatedSearchParams.delete("status");
    }
    updatedSearchParams.set("page", "1");
    updatedSearchParams.set("limit", String(ADMIN_PAGE_SIZE));
    setSearchParams(updatedSearchParams);
    setOpenOptions(false);
  };

  const handleClearFilters = () => {
    setFilters({ status: "" });
    const params = new URLSearchParams(searchParams);
    params.delete("status");
    params.set("page", "1");
    params.set("limit", String(ADMIN_PAGE_SIZE));
    setSearchParams(params);
    setOpenOptions(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => {
          if (!openOptions) {
            setFilters({ status: selectedStatus });
          }
          setOpenOptions((prev) => !prev);
        }}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
      >
        <FilterIcon className="w-4 h-4 text-gray-500" />
        Filter
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {openOptions && (
        <div className="absolute right-0 mt-2 w-64 md:w-72 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Status</h2>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white cursor-pointer appearance-none"
          >
            <option value="">Select Status</option>
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={handleClearFilters}
              className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Clear
            </button>
            <button
              onClick={handleSubmit}
              className="px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
