import { useState } from "react";
import { useNavigate } from "react-router";
import { Clipboard, Download, Loader2, Sparkles } from "lucide-react";
import Modal from "@/components/Modal";
import { useAuth } from "@/store";
import { toast } from "sonner";
import { useDownloadTailoredResume, useResumeAnalysis, useTailorResume } from "@/hooks/useResume";

const extractTailoredText = (res) => res?.data?.data?.tailoredText || res?.data?.tailoredText || res?.tailoredText;

export default function TailorResumeButton({ jobId, jobTitle = "", variant = "primary", className = "" }) {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { data: resume } = useResumeAnalysis();
  const tailorMutation = useTailorResume();
  const downloadMutation = useDownloadTailoredResume();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tailoredText, setTailoredText] = useState("");

  const handleTailor = async (event) => {
    event?.stopPropagation?.();
    event?.preventDefault?.();

    if (!accessToken) {
      toast.error("Please log in to tailor your resume");
      navigate("/auth/login");
      return;
    }

    if (!resume) {
      toast.error("Upload your resume first");
      navigate("/resume");
      return;
    }

    if (resume?.status !== "ready") {
      toast.error("Resume analysis is still running. Please try again in a moment.");
      return;
    }

    try {
      const res = await tailorMutation.mutateAsync({ jobId });
      const text = extractTailoredText(res);
      if (text) {
        setTailoredText(text);
        setIsModalOpen(true);
        toast.success("Tailored resume ready");
      }
    } catch (error) {
      // onError in hook already toasts
    }
  };

  const handleCopy = async () => {
    if (!tailoredText) return;
    try {
      await navigator.clipboard.writeText(tailoredText);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Unable to copy");
    }
  };

  const handleDownload = async () => {
    try {
      const res = await downloadMutation.mutateAsync({ jobId });
      const blob = res?.data || res;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tailored-${jobTitle || "resume"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // handled by hook
    }
  };

  const baseClasses = variant === "secondary"
    ? "border border-orange-200 text-orange-600 bg-white hover:bg-orange-50"
    : "bg-orange-500 text-white hover:bg-orange-600 shadow";

  return (
    <>
      <button
        type="button"
        onClick={handleTailor}
        disabled={tailorMutation.isPending}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition ${baseClasses} ${className}`}
      >
        {tailorMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        <span>Tailor Resume</span>
      </button>

      <Modal
        id={`tailor-${jobId}`}
        title={`Tailored for ${jobTitle || "this job"}`}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        showClose
        classname="max-w-3xl"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Review the tailored version, copy, or download as PDF.</p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-h-[420px] overflow-auto text-sm whitespace-pre-wrap leading-6 text-gray-800">
            {tailoredText || "Loading tailored resume..."}
          </div>
          <div className="flex flex-wrap gap-3 justify-end">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-800 hover:bg-gray-100"
            >
              <Clipboard className="h-4 w-4" />
              Copy text
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloadMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
            >
              {downloadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download PDF
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
