import { useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  getJobById,
  saveJob,
  unsaveJob,
  getSavedJobs,
  getAllJobs,
} from "@/api/api";
import {
  Bookmark,
  BookmarkCheck,
  Loader2,
  MapPin,
  Building2,
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Send,
  Upload,
} from "lucide-react";
import { useAuth } from "@/store";
import { toast } from "sonner";
import officeCollab from "/office_collab.jpg";
import Avatar from "@/components/Avatar"; // ✅ Import Avatar for company logos

export default function JobDetails() {
  const { id } = useParams();
  const { accessToken } = useAuth();

  const {
    data: job,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      const res = await getJobById(id, accessToken);
      return res.data?.data || null;
    },
    enabled: !!id && !!accessToken,
  });

  const { data: relatedJobs = [] } = useQuery({
    queryKey: ["relatedJobs", "random"],
    enabled: !!job,
    queryFn: async () => {
      const res = await getAllJobs({}, accessToken);
      const jobsList = Array.isArray(res.data?.data?.data) ? res.data.data.data : [];
      return [...jobsList].sort(() => 0.5 - Math.random());
    },
  });

  const { data: savedJobsResponse, refetch: refetchSavedJobs } = useQuery({
    queryKey: ["savedJobs", accessToken],
    queryFn: async () => {
      if (!accessToken) return [];
      let page = 1;
      const limit = 50;
      let totalPages = 1;
      const allSavedJobs = [];

      while (page <= totalPages) {
        const res = await getSavedJobs(accessToken, { page, limit });
        if (res.status !== 200) {
          break;
        }

        const currentPageItems = Array.isArray(res.data?.data) ? res.data.data : [];
        allSavedJobs.push(...currentPageItems);
        totalPages = Number(res.data?.totalPages) || 1;
        page += 1;
      }

      return allSavedJobs;
    },
    enabled: !!accessToken,
  });

  const savedJobIds = new Set(
    Array.isArray(savedJobsResponse)
      ? savedJobsResponse.map((j) => j._id || j.id)
      : [],
  );
  const isSaved = savedJobIds.has(id);

  const [saving, setSaving] = useState(false);

  const handleSaveToggle = async () => {
    if (!accessToken) {
      toast.error("Please login to save jobs");
      return;
    }
    setSaving(true);
    try {
      if (isSaved) {
        await unsaveJob(id, accessToken);
        toast.success("Job removed from saved");
      } else {
        await saveJob(id, accessToken);
        toast.success("Job saved successfully");
      }
      await Promise.all([refetch(), refetchSavedJobs()]);
    } catch {
      toast.error("Failed to update save status");
    } finally {
      setSaving(false);
    }
  };

  /** Format salary range for display */
  const formatSalary = (j) => {
    const target = j || job;
    if (!target?.salaryRange) return null;
    if (typeof target.salaryRange === "object") {
      const min = target.salaryRange.min;
      const max = target.salaryRange.max;
      if (min == null && max == null) return null;
      return `₦${(min / 1000).toFixed(0)}K - ₦${(max / 1000).toFixed(0)}k`;
    }
    return target.salaryRange;
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );

  if (!job)
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-xl font-semibold text-gray-800">Job not found</p>
        <p className="text-sm text-gray-500">ID: {id}</p>
        <Link to="/jobs" className="text-[#F57450] font-bold hover:underline">
          Back to all jobs
        </Link>
      </div>
    );

  const salary = formatSalary(job);

  // Filter out the current job and limit to 3
  const displayedRelatedJobs = relatedJobs
    .filter((j) => (j._id || j.id) !== (job._id || job.id))
    .slice(0, 3);

  return (
    <div className="pb-20">
      {/* ───── Hero Section ───── */}
      <section className="bg-[#FFC6AE] pt-6 pb-10">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Back link */}
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0A0A0A] mb-6 hover:opacity-70 transition-opacity"
          >
            <ArrowLeft size={16} />
            Back
          </Link>

          {/* ── White Card ── */}
          <div className="bg-white rounded-[24px] p-8 md:p-10 shadow-sm mb-6">
            {/* Job type badge - Uniform style matching JobCard */}
            <span className="inline-block bg-orange-100 text-xs px-3 py-1 rounded-full mb-4">
              {job.jobType}
            </span>

            {/* Logo + Title */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-[#E0E7FF] rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
                {/* ✅ Replace with Avatar component */}
                <Avatar
                  src={job.companyLogo?.url || job.companyLogo}
                  name={job.companyName}
                  alt={job.companyName}
                  size={48} // fits inside w-16 h-16 (64px) with padding/margin
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#0A0A0A]">
                {job.title}
              </h1>
            </div>

            {/* Location + Salary */}
            <div className="flex flex-wrap items-center gap-6 mb-6 text-sm text-gray-600 font-medium">
              <div className="flex items-center gap-1.5">
                <MapPin size={20} className="text-[#F57450]" />
                <span>{job.location}</span>
              </div>
              {salary && (
                <div className="flex items-center gap-1.5">
                  <img
                    src="https://res.cloudinary.com/dmb5ggmvg/image/upload/v1771448010/temaki_money-hand_ecxsvn.png"
                    className="text-black"
                    alt="money hand"
                  />
                  <span>{salary}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Link
                to={`/apply/${id}`}
                className="bg-[#F57450] text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#E06440] transition-colors shadow-md shadow-[#F57450]/20"
              >
                <Send size={16} />
                Apply Now
              </Link>
              <button
                onClick={handleSaveToggle}
                disabled={saving}
                className="border-2 border-[#F57450] text-[#F57450] bg-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#FFF0EB] transition-colors"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : isSaved ? (
                  <BookmarkCheck size={16} />
                ) : (
                  <Bookmark size={16} />
                )}
                Save Job
              </button>
            </div>
          </div>

          {/* ── Info Cards Row ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Posted On */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FFF0EB] rounded-xl flex items-center justify-center shrink-0">
                <Calendar size={18} className="text-[#F57450]" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Posted On</p>
                <p className="text-sm font-bold text-[#0A0A0A]">
                  {job.createdAt
                    ? new Date(job.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Seniority */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FFF0EB] rounded-xl flex items-center justify-center shrink-0">
                <User size={18} className="text-[#F57450]" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Seniority</p>
                <p className="text-sm font-bold text-[#0A0A0A]">
                  {job.experienceLevel || "N/A"}
                </p>
              </div>
            </div>

            {/* Company */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FFF0EB] rounded-xl flex items-center justify-center shrink-0">
                <Building2 size={18} className="text-[#F57450]" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Company</p>
                <p className="text-sm font-bold text-[#0A0A0A]">
                  {job.companyName || "N/A"}
                </p>
              </div>
            </div>

            {/* Working Time – hardcoded */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FFF0EB] rounded-xl flex items-center justify-center shrink-0">
                <Clock size={18} className="text-[#F57450]" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  Working Time
                </p>
                <p className="text-sm font-bold text-[#0A0A0A]">
                  mon/fry-9am-5pm
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Page Content ───── */}
      <div className="container mx-auto px-4 max-w-6xl pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Role Overview Card */}
            <div className="bg-white rounded-[32px] p-10 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-[#0A0A0A]">
                  Role Overview
                </h2>
              </div>
              <p className="text-[#555859] leading-[1.6] text-lg font-medium">
                {job.jobDescription}
              </p>
            </div>

            {/* What You'll Do Card */}
            <div className="bg-white rounded-[32px] p-10 shadow-sm">
              <h2 className="text-2xl font-bold text-[#0A0A0A] mb-6">
                What You'll Do
              </h2>
              <ul className="space-y-4">
                {(Array.isArray(job.responsibilities)
                  ? job.responsibilities
                  : typeof job.responsibilities === "string"
                    ? job.responsibilities.split(",").filter(Boolean)
                    : []
                ).map((item, index) => (
                  <li
                    key={index}
                    className="flex gap-3 text-[#555859] text-lg font-medium leading-[1.5]"
                  >
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#555859] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Skills & Experience Card */}
            <div className="bg-white rounded-[32px] p-10 shadow-sm">
              <h2 className="text-2xl font-bold text-[#0A0A0A] mb-6">
                Skills & Experience
              </h2>
              <ul className="space-y-4">
                {(Array.isArray(job.requirement)
                  ? job.requirement
                  : typeof job.requirement === "string"
                    ? job.requirement.split(",").filter(Boolean)
                    : []
                ).map((item, index) => (
                  <li
                    key={index}
                    className="flex gap-3 text-[#555859] text-lg font-medium leading-[1.5]"
                  >
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#555859] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits & Perks Card */}
            <div className="bg-white rounded-[32px] p-10 shadow-sm text-[#0A0A0A]">
              <h2 className="text-2xl font-bold mb-6">Benefits & Perks</h2>
              <div className="flex flex-wrap gap-3">
                {(Array.isArray(job.benefits)
                  ? job.benefits
                  : typeof job.benefits === "string"
                    ? job.benefits.split(",").filter(Boolean)
                    : []
                ).map((benefit, index) => (
                  <div
                    key={index}
                    className="bg-[#FFDACF] px-5 py-2.5 rounded-full text-lg font-bold"
                  >
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[32px] overflow-hidden shadow-sm p-4 h-fit sticky top-28">
              <div className="relative rounded-[24px] overflow-hidden mb-8 aspect-[411/300]">
                <img
                  src={officeCollab}
                  alt="Team collaboration"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="px-6 pb-6 text-center">
                <h3 className="text-[28px] font-bold text-[#0A0A0A] mb-4">
                  How to Apply
                </h3>
                <p className="text-[#6B7280] text-lg font-medium leading-relaxed mb-8">
                  Join the most innovative job board connecting ambitious talent
                  with world-class opportunities.
                </p>

                <Link
                  to={`/apply/${id}`}
                  className="w-full bg-[#F57450] text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#E06440] transition-all shadow-lg shadow-[#F57450]/20"
                >
                  <Upload size={20} />
                  Submit Application
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───── Related Opportunities ───── */}
      {displayedRelatedJobs.length > 0 && (
        <section className="mt-20 py-16 bg-[#FFF0EB]">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <p className="text-[#F57450] font-bold uppercase tracking-wider mb-2 text-sm">
              EXPLORE MORE ROLES
            </p>
            <h2 className="text-3xl font-bold text-[#0A0A0A] mb-12">
              Related Opportunities
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedRelatedJobs.map((relatedJob) => {
                // Inline formatting for Related Jobs
                let rSalary = null;
                if (relatedJob.salaryRange) {
                  if (typeof relatedJob.salaryRange === "object") {
                    const { min, max } = relatedJob.salaryRange;
                    if (min != null && max != null) {
                      rSalary = `₦ ${min.toLocaleString()} - ${max.toLocaleString()}`;
                    }
                  } else {
                    rSalary = relatedJob.salaryRange;
                  }
                }

                return (
                  <Link
                    to={`/jobs/${relatedJob._id || relatedJob.id}`}
                    key={relatedJob._id || relatedJob.id}
                    className="bg-white rounded-[24px] p-6 text-left shadow-sm hover:shadow-md transition-all flex flex-col h-full items-start"
                  >
                    {/* Badge - Uniform style matching JobCard */}
                    <span className="inline-block bg-orange-100 text-xs px-3 py-1 rounded-full mb-4">
                      {relatedJob.jobType}
                    </span>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-[#0A0A0A] mb-2 line-clamp-1">
                      {relatedJob.title}
                    </h3>

                    {/* Salary */}
                    <p className="text-sm font-semibold text-gray-700 mb-4">
                      Salary : {rSalary || "Not specified"}
                    </p>

                    {/* Description Snippet */}
                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 grow">
                      {relatedJob.jobDescription}
                    </p>

                    <div className="w-full h-px bg-gray-100 mb-4"></div>

                    {/* Footer */}
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-10 h-10 bg-[#E0E7FF] rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                        {/* ✅ Replace with Avatar for related jobs */}
                        <Avatar
                          src={relatedJob.companyLogo?.url || relatedJob.companyLogo}
                          name={relatedJob.companyName}
                          alt={relatedJob.companyName}
                          size={32} // matches w-10 h-10
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0A0A0A] line-clamp-1">
                          {relatedJob.companyName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(
                            relatedJob.createdAt || Date.now(),
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}