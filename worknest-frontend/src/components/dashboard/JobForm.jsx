import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ArrowLeft,
  Plus,
  Save,
  Send,
  Trash2,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { createJob, updateJob, uploadJobAvatar } from "@/api/api";
import { useAuth } from "@/store";
import { toast } from "sonner";

const JobForm = ({ job, onSave, onCancel }) => {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const submitStatusRef = useRef("active");
  const [formData, setFormData] = useState({
    title: "",
    jobType: "Full-Time",
    location: "",
    experienceLevel: "Mid",
    salaryRange: { min: "", max: "" },
    companyName: "",
    companyWebsite: "",
    category: "",
    jobDescription: "",
    responsibilities: "",
    requirement: "",
    benefits: "",
    applicationQuestions: [""],
  });

  useEffect(() => {
    if (job) {
      setFormData({
        ...formData,
        ...job,
        experienceLevel: job.experienceLevel || "Mid",
        salaryRange: job.salaryRange || { min: "", max: "" },
        responsibilities: job.responsibilities?.join("\n") || "",
        requirement: job.requirement?.join("\n") || "",
        benefits: job.benefits?.join("\n") || "",
        applicationQuestions: job.applicationQuestions || [""],
      });
    }
  }, [job]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...formData.applicationQuestions];
    newQuestions[index] = value;
    setFormData((prev) => ({ ...prev, applicationQuestions: newQuestions }));
  };

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      applicationQuestions: [...prev.applicationQuestions, ""],
    }));
  };

  const removeQuestion = (index) => {
    if (formData.applicationQuestions.length > 1) {
      const newQuestions = formData.applicationQuestions.filter(
        (_, i) => i !== index,
      );
      setFormData((prev) => ({ ...prev, applicationQuestions: newQuestions }));
    }
  };

  const handleSalaryChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      salaryRange: {
        ...prev.salaryRange,
        [name]: value === "" ? "" : Number(value),
      },
    }));
  };

  const handleSubmit = async (e, status) => {
    if (e) e.preventDefault();
    if (!job?._id && !avatarFile) {
      toast.error("Please upload a company logo image");
      return;
    }
    const resolvedStatus = status || submitStatusRef.current || "active";
    setLoading(true);
    try {
      const formattedData = {
        ...formData,
        status: resolvedStatus.toLowerCase(),
        salaryRange: {
          min:
            formData.salaryRange.min === "" || formData.salaryRange.min === null
              ? null
              : Number(formData.salaryRange.min),
          max:
            formData.salaryRange.max === "" || formData.salaryRange.max === null
              ? null
              : Number(formData.salaryRange.max),
        },
        responsibilities: (formData.responsibilities || "")
          .toString()
          .split("\n")
          .filter((line) => line && line.trim() !== ""),
        requirement: (formData.requirement || "")
          .toString()
          .split("\n")
          .filter((line) => line && line.trim() !== ""),
        benefits: (formData.benefits || "")
          .toString()
          .split("\n")
          .filter((line) => line && line.trim() !== ""),
        applicationQuestions: (formData.applicationQuestions || []).filter(
          (q) => q && q.trim() !== "",
        ),
      };

      let res;
      let savedJobId = job?._id;
      if (job?._id) {
        res = await updateJob(job._id, formattedData, accessToken);
      } else {
        res = await createJob(formattedData, accessToken);
        savedJobId =
          res?.data?.job?._id ||
          res?.data?.data?._id ||
          res?.data?._id ||
          savedJobId;
      }

      if (avatarFile && savedJobId) {
        await uploadJobAvatar({
          jobId: savedJobId,
          file: avatarFile,
          accessToken,
        });
      }

      if (res.status === 201 || res.status === 200) {
        toast.success(
          job ? "Job updated successfully" : "Job created successfully",
        );
        if (avatarFile) {
          toast.success("Logo uploaded successfully");
        }
        onSave();
      }
    } catch (error) {
      console.error("Error saving job:", error);
      toast.error(error?.response?.data?.message || "Failed to save job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 ">
      {/* Top Navigation */}
      <button
        onClick={onCancel}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6 text-sm font-medium"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0A0A0A]">
          {job ? "Edit Job" : "Create Job"}
        </h1>
        <p className="text-gray-500 text-sm">
          {job ? "Update existing job posting" : "Create a new job posting"}
        </p>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Section 1: Job Details */}
        <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#0A0A0A]">Job Details</h2>
            <p className="text-gray-500 text-xs">
              Basic information about the position
            </p>
          </div>

          <div className="space-y-6">
            {/* Row 1: Job Title & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Senior Frontend Developer"
                  className="w-full px-4 py-2.5  border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-200 transition-all text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. New York, NY or Remote"
                  className="w-full px-4 py-2.5  border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-200 transition-all text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Category *
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Design, Development"
                  className="w-full px-4 py-2.5  border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-200 transition-all text-sm"
                  required
                />
              </div>
            </div>

            {/* Row 2: Job Type, Experience Level, Salary Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Job Type *
                </label>
                <div className="relative">
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    className="w-full appearance-none px-4 py-2.5  border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-200 transition-all text-sm cursor-pointer"
                  >
                    <option>Full-Time</option>
                    <option>Part-Time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                    <option>Freelance</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Experience Level *
                </label>
                <div className="relative">
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                    className="w-full appearance-none px-4 py-2.5  border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-200 transition-all text-sm cursor-pointer"
                  >
                    <option value="Entry">Entry</option>
                    <option value="Mid">Mid</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead/Manager">Lead / Manager</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
              <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Salary Range (min/max)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="min"
                    value={formData.salaryRange.min}
                    onChange={handleSalaryChange}
                    placeholder="Min"
                    className="w-full px-4 py-2.5  border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-200 transition-all text-sm"
                  />
                  <input
                    type="number"
                    name="max"
                    value={formData.salaryRange.max}
                    onChange={handleSalaryChange}
                    placeholder="Max"
                    className="w-full px-4 py-2.5  border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-200 transition-all text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Company Information */}
        <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#0A0A0A]">
              Company Information
            </h2>
            <p className="text-gray-500 text-xs">
              Details about the hiring company
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Company Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. TechCorp Inc."
                className="w-full px-4 py-2.5  border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-200 transition-all text-sm"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Company Website (optional)
              </label>
              <input
                type="url"
                name="companyWebsite"
                value={formData.companyWebsite}
                onChange={handleChange}
                placeholder="https://example.com"
                className="w-full px-4 py-2.5  border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-200 transition-all text-sm"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Company Logo Image {!job?._id ? "*" : "(optional)"}
              </label>
              <input
                type="file"
                accept="image/*"
                required={!job?._id}
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2.5 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-200 transition-all text-sm"
              />
              <p className="text-xs text-gray-500">
                Upload an image file (PNG, JPG, WEBP).
              </p>
              {avatarFile ? (
                <p className="text-xs text-gray-500">{avatarFile.name}</p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Section 3: Job Content */}
        <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#0A0A0A]">Job Content</h2>
            <p className="text-gray-500 text-xs">
              Detailed job description and requirements
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Job Description *
              </label>
              <textarea
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleChange}
                placeholder="Describe the role, what the candidate will be doing..."
                className="w-full px-4 py-3  border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-200 transition-all text-sm h-32 resize-none"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Responsibilities *
              </label>
              <textarea
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleChange}
                placeholder="List the key responsibilities..."
                className="w-full px-4 py-3 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-200 transition-all text-sm h-32 resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Requirements *
              </label>
              <textarea
                name="requirement"
                value={formData.requirement}
                onChange={handleChange}
                placeholder="List the required skills and qualifications..."
                className="w-full px-4 py-3  border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-200 transition-all text-sm h-32 resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Benefits (optional)
              </label>
              <textarea
                name="benefits"
                value={formData.benefits}
                onChange={handleChange}
                placeholder="List the benefits and perks..."
                className="w-full px-4 py-3 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-200 transition-all text-sm h-32 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Application Questions */}
        <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#0A0A0A]">
              Application Questions
            </h2>
            <p className="text-gray-500 text-xs">
              Add custom questions for applicants
            </p>
          </div>

          <div className="space-y-4">
            {formData.applicationQuestions.map((question, index) => (
              <div key={index} className="flex gap-3">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => handleQuestionChange(index, e.target.value)}
                  placeholder={`Question ${index + 1}`}
                  className="flex-1 px-4 py-2.5  border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-200 transition-all text-sm"
                />
                {formData.applicationQuestions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="p-2.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-(--color-primary) rounded-lg border border-gray-200 transition-all"
            >
              <Plus size={16} />
              Add Question
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            disabled={loading}
            onClick={(e) => handleSubmit(e, "draft")}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white hover:text-black/90 bg-black/90 border border-gray-200 rounded-lg hover:bg-white transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            Save as Draft
          </button>
          <button
            type="submit"
            disabled={loading}
            onClick={() => {
              submitStatusRef.current = "active";
            }}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-(--sidebar-active-color) rounded-lg hover:bg-black/90 transition-all shadow-lg shadow-black/5 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Send size={18} />
            )}
            Publish Job
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobForm;
