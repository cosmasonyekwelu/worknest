import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getJobById, updateJob } from "@/api/api";
import { getAllApplications } from "@/api/applications";
import { useAuth } from "@/store";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit2,
  CircleX,
  Users,
  Loader2,
  MapPin,
  Briefcase,
  CircleDollarSign,
  Handbag,
} from "lucide-react";

export default function AdminJobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [isClosing, setIsClosing] = useState(false);

  // Fetch job details
  const {
    data: job,
    isLoading: jobLoading,
    error: jobError,
  } = useQuery({
    queryKey: ["admin-job", id],
    queryFn: async () => {
      const res = await getJobById(id, accessToken);
      return res.data?.data || res.data;
    },
    enabled: !!id && !!accessToken,
  });

  // Fetch applications count for this job
  const { data: applicationsData, isLoading: appsLoading } = useQuery({
    queryKey: ["job-applications-count", id],
    queryFn: async () => {
      const res = await getAllApplications({
        jobId: id,
        page: 1,
        limit: 1,
        accessToken,
      });
      return res;
    },
    enabled: !!id && !!accessToken,
  });

  const applicationsCount = applicationsData?.total || 0;

  const handleEdit = () => {
    navigate("/admin/jobs", { state: { editJob: job } });
  };

  const handleCloseJob = async () => {
    try {
      setIsClosing(true);
      await updateJob(id, { status: "closed" }, accessToken);
      toast.success("Job closed successfully");
      navigate("/admin/jobs");
    } catch (error) {
      console.error("Error closing job:", error);
      toast.error(error.response?.data?.message || "Failed to close job");
    } finally {
      setIsClosing(false);
    }
  };

  const handleViewApplications = () => {
    navigate(`/admin/jobs/${id}/applications`);
  };

  const handleBack = () => {
    navigate("/admin/jobs");
  };

  if (jobLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#F57450]" />
        <p className="mt-4 text-gray-500">Loading job details...</p>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500">Failed to load job details</p>
        <button
          onClick={handleBack}
          className="mt-4 text-gray-600 hover:text-gray-900"
        >
          ← Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-500 hover:text-black mb-6 transition-all group font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-black" />
          <span>Back</span>
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">
              {job.title}
            </h1>
            <p className="text-gray-400 font-bold text-lg">{job.companyName}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
            >
              <Edit2 size={16} />
              Edit
            </button>
            <button
              onClick={handleViewApplications}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
            >
              <Users size={16} />
              Applications ({appsLoading ? "..." : applicationsCount})
            </button>
            <button
              onClick={handleCloseJob}
              disabled={isClosing || job.status === "closed"}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-red-500 border border-red-500 hover:bg-red-100 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CircleX size={16} />
              {isClosing ? "Closing..." : "Close Job"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Job Description */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Job Description
            </h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {job.jobDescription}
            </p>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Responsibilities
              </h2>
              <ul className="space-y-2">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#F57450] mt-1">•</span>
                    <span className="text-gray-600">{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Requirements
              </h2>
              <ul className="space-y-2">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#F57450] mt-1">•</span>
                    <span className="text-gray-600">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Benefits</h2>
              <ul className="space-y-2">
                {job.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-600">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Job Information */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Job Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium">
                    {job.location || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-l flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium">
                    {job.jobType || "Not specified"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                  <Handbag className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium">
                    {job.experienceLevel || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                  <CircleDollarSign className="w-5 h-5 " />
                </div>
                <div>
                  <p className="text-gray-900 font-medium">
                    {typeof job.salaryRange === "object" && job.salaryRange
                      ? `₦${job.salaryRange.min?.toLocaleString() || 0} - ₦${job.salaryRange.max?.toLocaleString() || 0}`
                      : job.salaryRange || "Not specified"}
                  </p>
                </div>
              </div>

              {/* <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">
                    Status
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      job.status === "active"
                        ? "bg-green-50 text-green-600"
                        : job.status === "closed"
                          ? "bg-red-50 text-red-600"
                          : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
              </div> */}
            </div>
          </div>

          {/* Applications Summary */}
          <div className="rounded-2xl p-6 shadow-sm border border-orange-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Applications
            </h3>
            <p className="text-4xl font-extrabold text-[#F57450] mb-4">
              {appsLoading ? "..." : applicationsCount}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Total applications received
            </p>
            <button
              onClick={handleViewApplications}
              className="w-full bg-[#F57450] text-white px-4 py-2.5 rounded-lg font-bold hover:bg-[#E05B35] transition-all"
            >
              View All Applications
            </button>
          </div>

          {/* Posted Date */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 font-bold uppercase mb-1">
              Posted On
            </p>
            <p className="text-gray-900 font-medium">
              {job.createdAt
                ? new Date(job.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Not available"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
