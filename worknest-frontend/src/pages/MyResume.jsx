import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, FileText, Loader2, Sparkles, Upload } from "lucide-react";
import { useResumeAnalysis, useUploadResume } from "@/hooks/useResume";
import { formatDate } from "@/utils/constant";
import { toast } from "sonner";

const StatusBadge = ({ status }) => {
  const map = {
    uploaded: "bg-blue-50 text-blue-700 border-blue-100",
    analyzing: "bg-yellow-50 text-yellow-800 border-yellow-100",
    ready: "bg-green-50 text-green-700 border-green-100",
    failed: "bg-red-50 text-red-700 border-red-100",
  };
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${map[status] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
      <span className="w-2 h-2 rounded-full bg-current" />
      {status || "not uploaded"}
    </span>
  );
};

const Pill = ({ children }) => (
  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-semibold">
    {children}
  </span>
);

export default function MyResume() {
  const navigate = useNavigate();
  const { data: resume, isLoading } = useResumeAnalysis();
  const uploadMutation = useUploadResume();
  const [selectedFileName, setSelectedFileName] = useState("");

  const analysis = resume?.analysis || null;

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB");
      return;
    }

    setSelectedFileName(file.name);
    uploadMutation.mutate({ file });
  };

  const hasAnalysis = useMemo(() => !!analysis && resume?.status === "ready", [analysis, resume?.status]);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-black font-semibold mb-6"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <p className="text-sm font-semibold text-orange-500">Resume Intelligence</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">My Resume</h1>
            <p className="text-gray-500 mt-2 max-w-2xl">
              Upload once, get AI-powered insights, and tailor for any job in seconds.
            </p>
          </div>
          <StatusBadge status={resume?.status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Upload Panel */}
          <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Upload size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Upload Resume</h2>
                <p className="text-sm text-gray-500">PDF or DOCX, max 5MB</p>
              </div>
            </div>

            <label className="flex flex-col items-center justify-center gap-3 px-4 py-8 border-2 border-dashed border-gray-200 rounded-xl hover:border-orange-200 hover:bg-orange-50/40 transition cursor-pointer">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileChange}
              />
              {uploadMutation.isPending ? (
                <Loader2 className="animate-spin text-orange-500" size={28} />
              ) : (
                <Upload className="text-gray-400" size={28} />
              )}
              <div className="text-center">
                <p className="font-semibold text-gray-800">Drop your resume here or click to browse</p>
                <p className="text-xs text-gray-500">We start analyzing as soon as it uploads.</p>
              </div>
            </label>

            {selectedFileName && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-100 rounded-xl text-sm text-orange-800">
                <FileText size={16} />
                <span className="truncate">{selectedFileName}</span>
              </div>
            )}

            {resume?.originalFile?.uploadedAt && (
              <p className="text-xs text-gray-500">Last uploaded: {formatDate(resume.originalFile.uploadedAt)}</p>
            )}
          </div>

          {/* Analysis Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-orange-500" size={18} />
                  <h3 className="text-lg font-bold text-gray-900">Analysis</h3>
                </div>
                {resume?.status === "analyzing" && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="animate-spin" size={16} />
                    Running analysis...
                  </div>
                )}
              </div>

              {!resume && !isLoading && (
                <div className="text-center py-10 text-gray-500">
                  <p className="font-semibold mb-2">No resume uploaded yet</p>
                  <p className="text-sm">Upload your resume to see insights and tailored versions here.</p>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center gap-3 text-gray-500 py-8">
                  <Loader2 className="animate-spin" size={20} />
                  Loading your resume...
                </div>
              )}

              {hasAnalysis && (
                <div className="space-y-6">
                  {analysis.summary && (
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-sm text-gray-500 font-semibold mb-1">Summary</p>
                      <p className="text-gray-800 leading-relaxed">{analysis.summary}</p>
                    </div>
                  )}

                  {Array.isArray(analysis.careerPaths) && analysis.careerPaths.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-600">Career path suggestions</p>
                      <div className="grid md:grid-cols-2 gap-3">
                        {analysis.careerPaths.map((path, idx) => (
                          <div key={idx} className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-bold text-gray-900">{path.title}</p>
                              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                {Math.round(path.matchScore ?? 0)}%
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">{path.feedback}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(analysis.skills) && analysis.skills.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-600">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.skills.map((skill, idx) => (
                          <Pill key={`${skill}-${idx}`}>{skill}</Pill>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    {Array.isArray(analysis.strengths) && analysis.strengths.length > 0 && (
                      <div className="border border-green-100 bg-green-50/60 rounded-xl p-4 space-y-2">
                        <p className="text-sm font-semibold text-green-800">Strengths</p>
                        <ul className="list-disc list-inside text-sm text-green-900 space-y-1">
                          {analysis.strengths.map((item, idx) => (
                            <li key={`strength-${idx}`}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {Array.isArray(analysis.gaps) && analysis.gaps.length > 0 && (
                      <div className="border border-orange-100 bg-orange-50/60 rounded-xl p-4 space-y-2">
                        <p className="text-sm font-semibold text-orange-800">Gaps / Suggestions</p>
                        <ul className="list-disc list-inside text-sm text-orange-900 space-y-1">
                          {analysis.gaps.map((item, idx) => (
                            <li key={`gap-${idx}`}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-600">Tailor resumes faster</p>
                <p className="text-gray-800 font-bold">Head to any job and tap "Tailor Resume" to generate a job-matched version in seconds.</p>
              </div>
              <button
                onClick={() => navigate("/jobs")}
                className="inline-flex items-center gap-2 px-5 py-3 bg-orange-500 text-white rounded-xl font-bold shadow hover:bg-orange-600 transition"
              >
                Browse Jobs
                <Sparkles size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
