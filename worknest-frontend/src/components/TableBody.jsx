// TableBody.jsx
const getCellText = (item, columnKey) => {
  const directValue = item?.[columnKey];
  if (typeof directValue === "string" || typeof directValue === "number") {
    return String(directValue);
  }

  switch (columnKey) {
    case "applicantName":
      return [item?.applicant?.name, item?.applicant?.email]
        .filter(Boolean)
        .join(" - ");
    case "jobTitle":
      return item?.job?.title || item?.jobTitle || "";
    case "companyName":
      return item?.companyName || item?.company?.name || item?.job?.companyName || "";
    case "location":
      return item?.location || item?.job?.location || "";
    case "url":
    case "urls":
      return item?.[columnKey] || item?.job?.[columnKey] || "";
    default:
      return "";
  }
};

export default function TableBody({ tableColumns, tableData, renderCell }) {
  return (
    <div className="w-full">
      <table className="w-full table-auto border-collapse border border-gray-200">
        <thead className="hidden bg-gray-50 md:table-header-group">
          <tr>
            <th className="px-4 py-2 border-b text-left text-md font-bold">
              #
            </th>
            {tableColumns.map((header) => (
              <th
                key={header.uid}
                className="px-4 py-2 border-b text-start text-md font-bold"
              >
                {header.name}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="block bg-white md:table-row-group">
          {tableData?.length > 0 ? (
            tableData.map((item, index) => (
              <tr
                key={item._id || item.id}
                className="mb-3 block rounded-xl border border-gray-200 bg-white p-2 hover:bg-gray-50 md:mb-0 md:table-row md:rounded-none md:border-x-0 md:border-t-0 md:p-0"
              >
                <td className="flex items-center justify-between gap-4 px-4 py-2 md:table-cell">
                  <span className="text-xs font-semibold text-gray-400 uppercase md:hidden">
                    #
                  </span>
                  <span
                    className="block max-w-[220px] truncate text-right md:text-left"
                    title={String(index + 1)}
                  >
                    {index + 1}
                  </span>
                </td>
                {tableColumns.map((header) => {
                  const cellContent = renderCell
                    ? renderCell(item, header.uid)
                    : item?.[header.uid] || "";
                  const cellText = getCellText(item, header.uid);
                  const isPlainValue =
                    typeof cellContent === "string" ||
                    typeof cellContent === "number";

                  return (
                    <td
                      key={header.uid}
                      className="flex items-center justify-between gap-4 px-4 py-2 text-start align-top md:table-cell"
                    >
                      <span className="text-xs font-semibold text-gray-400 uppercase md:hidden">
                        {header.name}
                      </span>
                      <div className="min-w-0 flex-1 text-right md:text-left">
                        {isPlainValue ? (
                          <span
                            className="ml-auto block max-w-[220px] truncate md:ml-0"
                            title={cellText || undefined}
                          >
                            {cellContent}
                          </span>
                        ) : (
                          <div
                            className="ml-auto max-w-[220px] md:ml-0 md:max-w-none"
                            title={cellText || undefined}
                          >
                            {cellContent}
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr className="block md:table-row">
              <td
                colSpan={tableColumns.length + 1}
                className="block h-24 text-center text-gray-500 md:table-cell"
              >
                No applications found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
