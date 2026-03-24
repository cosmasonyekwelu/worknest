import dayjs from "dayjs";

export const slideShow = [
  {
    id: 1,
    src: "/out.jpg",
    caption:
      "“WorkNest has completely transformed how we manage employer and employee records. What used to take hours now happens in minutes.”",
  },
  {
    id: 2,
    src: "/in.jpg",
    caption:
      "“WorkNest is designed to create opportunities and a sane workspace for all tech lifestyle.”",
  },
];

export const headers = (accessToken) => {
  if (!accessToken) return {};
  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
};

export const statusConfig = [
  { label: "Submitted", value: "submitted" },
  { label: "In Review", value: "in_review" },
  { label: "Shortlisted", value: "shortlisted" },
  { label: "Interview", value: "interview" },
  { label: "Offer", value: "offer" },
  { label: "Rejected", value: "rejected" },
  { label: "Hired", value: "hired" },
];

const normalizeStatusToken = (statusValue = "") =>
  String(statusValue).trim().toLowerCase().replace(/\s+/g, "_");

export const normalizeApplicationStatus = (statusValue = "") => {
  if (!statusValue) return "";

  const normalizedToken = normalizeStatusToken(statusValue);
  const matchedStatus = statusConfig.find(
    (status) =>
      status.value === normalizedToken ||
      normalizeStatusToken(status.label) === normalizedToken,
  );

  return matchedStatus?.value || normalizedToken;
};

// export const getStatusColor = (statusValue) => {
//   const colors = {
//     Submitted: "bg-orange-100 text-orange-800",
//     Interviewing: "bg-blue-100 text-blue-800",
//     Viewed: "bg-purple-100 text-purple-800",
//     Rejected: "bg-red-100 text-red-800",
//     Offer: "bg-green-100 text-green-800",
//   };
//   return colors[statusValue] || "bg-gray-100 text-gray-800";
// };

export const getStatusStyles = (status) => {
  // Normalize status to lowercase for comparison
  const normalizedStatus = status?.toLowerCase();

  const styles = {
    submitted: "bg-[#DBEAFE] text-[#2563EB] border-transparent",
    pending: "bg-[#DBEAFE] text-[#2563EB] border-transparent",
    in_review: "bg-[#F3E8FF] text-[#9333EA] border-transparent",
    shortlisted: "bg-[#DCFCE7] text-[#16A34A] border-transparent",
    interview: "bg-[#F3E8FF] text-[#9333EA] border-transparent",
    rejected: "bg-[#FEE2E2] text-[#DC2626] border-transparent",
    offer: "bg-[#DCFCE7] text-[#16A34A] border-transparent",
    hired: "bg-[#DCFCE7] text-[#16A34A] border-transparent",
  };
  return (
    styles[normalizedStatus] || "bg-gray-100 text-gray-700 border-transparent"
  );
};

export const applicationColumns = [
  {
    name: "Candidates",
    uid: "applicantName",
  },
  {
    name: "Job Title",
    uid: "jobTitle",
  },
  {
    name: "Applied Date",
    uid: "appliedDate",
  },
  { name: "Status", uid: "status" },
  { name: "Action", uid: "action" },
];

export const formatDate = (item, format = "display") => {
  if (format === "input") {
    return dayjs(item).format("YYYY-MM-DD");
  }
  return dayjs(item).format("DD/MM/YYYY");
};
