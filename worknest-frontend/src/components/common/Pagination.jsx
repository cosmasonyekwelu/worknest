import React from "react";

const getPageRange = (page, totalPages, maxVisible = 5) => {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, page - half);
  let end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  isLoading = false,
}) {
  const safeTotalPages = Math.max(1, Number(totalPages) || 1);
  const safePage = Math.min(Math.max(1, Number(page) || 1), safeTotalPages);
  const pageRange = getPageRange(safePage, safeTotalPages);

  if (safeTotalPages <= 1) return null;

  const handlePageChange = (nextPage) => {
    if (isLoading) return;
    if (nextPage < 1 || nextPage > safeTotalPages) return;
    if (nextPage === safePage) return;
    onPageChange(nextPage);
  };

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        disabled={isLoading || safePage <= 1}
        onClick={() => handlePageChange(safePage - 1)}
        className="px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Prev
      </button>

      {pageRange.map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          disabled={isLoading}
          onClick={() => handlePageChange(pageNumber)}
          className={`min-w-10 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
            pageNumber === safePage
              ? "bg-[#F57450] text-white border-[#F57450]"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
          }`}
        >
          {pageNumber}
        </button>
      ))}

      <span className="px-2 text-sm font-medium text-gray-600">
        Page {safePage} of {safeTotalPages}
      </span>

      <button
        type="button"
        disabled={isLoading || safePage >= safeTotalPages}
        onClick={() => handlePageChange(safePage + 1)}
        className="px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}
