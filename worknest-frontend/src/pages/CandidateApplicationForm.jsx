import React, { useState } from "react";
import {
  Upload,
  Link as LinkIcon,
  X,
  Loader2,
  User,
  Phone,
  MapPin,
  ArrowLeft,
} from "lucide-react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getJobById } from "@/api/api";
import { applyToJob } from "@/api/applications";
import ApplicationSuccessModal from "@/features/applicationUser/ApplicationSuccessModal";
import { useAuth } from "@/store";
import { toast } from "sonner";

export default function ApplicationForm() {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { accessToken, user } = useAuth();

  // Initialize form state
  const [formState, setFormState] = useState({});
  const [cvFile, setCvFile] = useState(null);
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Personal Info State
  const [personalInfo, setPersonalInfo] = useState({
    firstname: user?.firstName || "",
    lastname: user?.lastName || "",
    email: user?.email || "",
    phone: "",
    currentLocation: "",
  });

  const { data: job, isLoading: isLoadingJob } = useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const res = await getJobById(jobId, accessToken);
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data[0] : data;
    },
    enabled: !!jobId && !!accessToken,
  });

  const questions = job?.applicationQuestions || [];

  const applyMutation = useMutation({
    mutationFn: (formData) => applyToJob({ jobId, formData, accessToken }),
    onSuccess: () => {
      toast.success("Application submitted successfully! 🚀");
      // Invalidate my applications cache so the new one shows up
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      setIsSuccessModalOpen(true);
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to submit application";
      toast.error(message);
    },
  });

  const handleInputChange = (question, value) => {
    setFormState((prev) => ({ ...prev, [question]: value }));
  };

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit");
        return;
      }
      setCvFile(file);
    }
  };

  const removeFile = () => {
    setCvFile(null);
  };

  const handleAddUrl = (type) => {
    const url = prompt(
      `Enter your ${type === "portfolio" ? "Portfolio" : "LinkedIn"} URL:`,
    );
    if (url) {
      if (type === "portfolio") setPortfolioUrl(url);
      else setLinkedinUrl(url);
    }
  };

  const removeUrl = (type) => {
    if (type === "portfolio") setPortfolioUrl("");
    else setLinkedinUrl("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cvFile) {
      toast.error("Please upload your resume");
      return;
    }

    if (
      !personalInfo.firstname ||
      !personalInfo.lastname ||
      !personalInfo.email
    ) {
      toast.error("Please fill in all required personal information");
      return;
    }

    const answersArray = questions.map((q) => ({
      question: q,
      answer: formState[q] || "",
    }));

    const formData = new FormData();
    formData.append("resume", cvFile);
    if (portfolioUrl) formData.append("portfolioUrl", portfolioUrl);
    if (linkedinUrl) formData.append("linkedinUrl", linkedinUrl);
    formData.append("answers", JSON.stringify(answersArray));

    // Append personalInfo as JSON string
    formData.append("personalInfo", JSON.stringify(personalInfo));

    applyMutation.mutate(formData);
  };

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };

  const handleExploreMoreJobs = () => {
    setIsSuccessModalOpen(false);
    navigate("/jobs");
  };

  const handleTrackApplication = () => {
    setIsSuccessModalOpen(false);
    navigate("/my-applications");
  };

  if (isLoadingJob) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#F57450]" size={48} />
      </div>
    );
  }

  return (
    <>
      <div className="container py-8 max-w-4xl mx-auto px-4">
      <form onSubmit={handleSubmit} className="space-y-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-black transition-all mb-4 font-bold text-sm"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 border-b border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
              Apply for {job?.title}
            </h2>
            <p className="text-[#F57450] font-bold mt-1">{job?.companyName}</p>
          </div>

          <div className="p-6 md:p-10 space-y-10">
            {/* Personal Information */}
            <section className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <User className="w-5 h-5 text-[#F57450]" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    First Name <span className="text-[#F57450]">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstname"
                    value={personalInfo.firstname}
                    onChange={handlePersonalInfoChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#F57450] focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    Last Name <span className="text-[#F57450]">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastname"
                    value={personalInfo.lastname}
                    onChange={handlePersonalInfoChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#F57450] focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    placeholder="Doe"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700">
                    Email <span className="text-[#F57450]">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={personalInfo.email}
                    onChange={handlePersonalInfoChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#F57450] focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" /> Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={personalInfo.phone}
                    onChange={handlePersonalInfoChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#F57450] focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" /> Current
                    Location
                  </label>
                  <input
                    type="text"
                    name="currentLocation"
                    value={personalInfo.currentLocation}
                    onChange={handlePersonalInfoChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#F57450] focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    placeholder="New York, NY"
                  />
                </div>
              </div>
            </section>

            {/* Professional Information */}
            <section className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                Professional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Resume Upload */}
                <div className="flex flex-col gap-3">
                  <label className="flex flex-col items-center justify-center gap-3 px-5 py-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-100/50 hover:border-orange-200 transition-all text-center group">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Upload className="w-6 h-6 text-gray-400 group-hover:text-[#F57450] transition-colors" />
                    <span className="text-sm font-bold text-gray-600">
                      Upload Resume *
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      PDF, DOC, DOCX (Max 5MB)
                    </span>
                  </label>
                  {cvFile && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-orange-50/50 border border-orange-100 rounded-xl">
                      <span className="flex-1 text-xs font-bold text-orange-900 truncate">
                        {cvFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-1.5 text-orange-400 hover:bg-orange-100 rounded-lg transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Portfolio */}
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => handleAddUrl("portfolio")}
                    className="flex flex-col items-center justify-center gap-3 px-5 py-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl hover:bg-gray-100/50 hover:border-orange-200 transition-all text-center group"
                  >
                    <LinkIcon className="w-6 h-6 text-gray-400 group-hover:text-[#F57450] transition-colors" />
                    <span className="text-sm font-bold text-gray-600">
                      Portfolio URL
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      Link your work
                    </span>
                  </button>
                  {portfolioUrl && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-orange-50/50 border border-orange-100 rounded-xl">
                      <span className="flex-1 text-xs font-bold text-orange-900 truncate">
                        {portfolioUrl}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeUrl("portfolio")}
                        className="p-1.5 text-orange-400 hover:bg-orange-100 rounded-lg transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* LinkedIn */}
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => handleAddUrl("linkedin")}
                    className="flex flex-col items-center justify-center gap-3 px-5 py-8 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl hover:bg-gray-100/50 hover:border-orange-200 transition-all text-center group"
                  >
                    <LinkIcon className="w-6 h-6 text-gray-400 group-hover:text-[#F57450] transition-colors" />
                    <span className="text-sm font-bold text-gray-600">
                      LinkedIn Profile
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      Professional social
                    </span>
                  </button>
                  {linkedinUrl && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-orange-50/50 border border-orange-100 rounded-xl">
                      <span className="flex-1 text-xs font-bold text-orange-900 truncate">
                        {linkedinUrl}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeUrl("linkedin")}
                        className="p-1.5 text-orange-400 hover:bg-orange-100 rounded-lg transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Application Questions */}
            {questions.length > 0 && (
              <section className="space-y-6 pt-4">
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                  Application Questions
                </h3>
                <div className="space-y-6">
                  {questions.map((question, index) => (
                    <div key={index} className="flex flex-col gap-3">
                      <label className="text-sm font-bold text-gray-600">
                        {question} <span className="text-[#F57450]">*</span>
                      </label>
                      <textarea
                        value={formState[question] || ""}
                        onChange={(e) =>
                          handleInputChange(question, e.target.value)
                        }
                        className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:border-orange-200 focus:ring-4 focus:ring-orange-50 outline-none transition-all min-h-[120px] font-medium placeholder-gray-300"
                        placeholder="Type your answer here..."
                        required
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="pt-8">
              <button
                type="submit"
                disabled={applyMutation.isPending}
                className="w-full py-5 bg-[#F57450] text-white font-extrabold rounded-2xl shadow-xl shadow-orange-100 hover:bg-[#E05B35] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
              >
                {applyMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  "Submit Application"
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
      </div>
      <ApplicationSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleCloseSuccessModal}
        onExploreMoreJobs={handleExploreMoreJobs}
        onTrackApplication={handleTrackApplication}
        companyName={job?.companyName || "Company"}
        position={job?.title || "Position"}
      />
    </>
  );
}

