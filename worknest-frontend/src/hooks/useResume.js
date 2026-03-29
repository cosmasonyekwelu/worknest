import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/store";
import {
  downloadTailoredResume,
  downloadCustomTailoredResume,
  fetchResumeAnalysis,
  tailorResumeCustom,
  tailorResumeForJob,
  uploadResumeFile,
} from "@/api/resume";

const extractData = (res) => res?.data?.data ?? res?.data ?? res;

export function useResumeAnalysis() {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ["resume-analysis"],
    enabled: !!accessToken,
    retry: false,
    queryFn: async () => {
      try {
        const res = await fetchResumeAnalysis(accessToken);
        return extractData(res);
      } catch (error) {
        if (error?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
  });
}

export function useUploadResume() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file }) => uploadResumeFile({ file, accessToken }),
    onSuccess: () => {
      toast.success("Resume uploaded. We’re running analysis now.");
      queryClient.invalidateQueries({ queryKey: ["resume-analysis"] });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || "Failed to upload resume";
      toast.error(message);
    },
  });
}

export function useTailorResume() {
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: ({ jobId }) => tailorResumeForJob({ jobId, accessToken }),
    onError: (error) => {
      const message = error?.response?.data?.message || "Unable to tailor resume";
      toast.error(message);
    },
  });
}

export function useDownloadTailoredResume() {
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: ({ jobId }) => downloadTailoredResume({ jobId, accessToken }),
    onError: (error) => {
      const message = error?.response?.data?.message || "Download failed";
      toast.error(message);
    },
  });
}

export function useTailorResumeCustom() {
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: ({ jobDescription }) => tailorResumeCustom({ jobDescription, accessToken }),
    onError: (error) => {
      const message = error?.response?.data?.message || "Unable to tailor resume";
      toast.error(message);
    },
  });
}

export function useDownloadCustomTailoredResume() {
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: ({ jobDescription, format }) => downloadCustomTailoredResume({ jobDescription, format, accessToken }),
    onError: (error) => {
      const message = error?.response?.data?.message || "Download failed";
      toast.error(message);
    },
  });
}
