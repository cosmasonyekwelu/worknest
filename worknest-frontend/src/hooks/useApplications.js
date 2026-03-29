import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyApplications,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  updateApplicationNote,
  getApplicationStats,
  getApplicationCountsByJobIds,
  triggerAIReview,
  submitInterviewAnswers,
  updateApplicationPersonalInfo,
} from "@/api/applications";
import { useAuth } from "@/store";
import { toast } from "sonner";
import { ADMIN_PAGE_SIZE } from "@/constants/pagination";

export function useMyApplications(params = {}) {
  const { accessToken, authReady } = useAuth();
  return useQuery({
    queryKey: ["my-applications", params],
    queryFn: () => getMyApplications({ ...params, accessToken }),
    enabled: authReady && !!accessToken,
  });
}

export function useAdminApplications(params = {}) {
  const { accessToken, authReady } = useAuth();
  const {
    page = 1,
    status = "",
    jobId = "",
    keyword = "",
    startDate = "",
    endDate = "",
  } = params;

  const queryParams = {
    page,
    limit: ADMIN_PAGE_SIZE,
    status,
    jobId,
    keyword,
    startDate,
    endDate,
  };

  return useQuery({
    queryKey: ["admin-applications", queryParams],
    queryFn: async () => {
      try {
        return await getAllApplications({ ...queryParams, accessToken });
      } catch (error) {
        if (import.meta.env.DEV) {
          console.debug("Admin applications request failed", {
            status: error?.response?.status,
            message: error?.response?.data?.message || error?.message,
          });
        }
        throw error;
      }
    },
    enabled: authReady && !!accessToken,
    placeholderData: (previousData) => previousData,
  });
}

export function useApplicationDetails(id) {
  const { accessToken, authReady } = useAuth();
  return useQuery({
    queryKey: ["application-details", id],
    queryFn: () => getApplicationById({ id, accessToken }),
    enabled: authReady && !!id && !!accessToken,
    refetchInterval: (query) =>
      query.state.data?.aiProcessingStatus === "processing" ? 3000 : false,
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: ({ applicationId, status, note }) =>
      updateApplicationStatus({
        id: applicationId,
        status,
        note,
        accessToken,
      }),
    onSuccess: (res, variables) => {
      // Invalidate all related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      queryClient.invalidateQueries({
        queryKey: ["application-details", variables.applicationId],
      });
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      queryClient.invalidateQueries({ queryKey: ["application-stats"] });

      toast.success("Status updated successfully");
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Failed to update status";
      console.error("Status update failed:", {
        status: error.response?.status,
        message: errorMessage,
        error,
      });
      toast.error(errorMessage);
    },
  });
}

export function useUpdateApplicationNote() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: ({ applicationId, note }) =>
      updateApplicationNote({
        id: applicationId,
        note,
        accessToken,
      }),
    onSuccess: (res, variables) => {
      // Optimistically update cache for instant UI feedback
      queryClient.setQueryData(
        ["application-details", variables.applicationId],
        (oldData) => {
          if (!oldData) return oldData;
          return { ...oldData, internalNote: variables.note };
        },
      );

      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      queryClient.invalidateQueries({
        queryKey: ["application-details", variables.applicationId],
      });
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });

      toast.success("Note saved successfully ✅");
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save note";
      console.error("Note update failed:", {
        status: error?.response?.status,
        message: errorMessage,
        error,
      });
      toast.error(errorMessage);
    },
  });
}

export function useApplicationStats(jobId) {
  const { accessToken, authReady } = useAuth();
  return useQuery({
    queryKey: ["application-stats", jobId],
    queryFn: () => getApplicationStats({ jobId, accessToken }),
    enabled: authReady && !!accessToken,
  });
}

/**
 * Hook to fetch application counts for multiple jobs
 * Returns a map of jobId -> count
 */
export function useJobApplicationCounts(jobIds) {
  const { accessToken, authReady } = useAuth();

  return useQuery({
    queryKey: ["job-application-counts", jobIds],
    queryFn: async () => {
      if (!jobIds || jobIds.length === 0) return {};
      const res = await getApplicationCountsByJobIds({ jobIds, accessToken });
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      return data.reduce((acc, item) => {
        acc[item.jobId] = item.count;
        return acc;
      }, {});
    },
    enabled: authReady && !!accessToken && jobIds && jobIds.length > 0,
    staleTime: 30000, // Cache for 30 seconds
  });
}


export function useTriggerAIReview() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: ({ applicationId }) => triggerAIReview({ id: applicationId, accessToken }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      queryClient.invalidateQueries({ queryKey: ["application-details", variables.applicationId] });
      toast.success("AI review started");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "AI review failed");
    },
  });
}

export function useSubmitInterviewAnswers() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: ({ applicationId, answers }) => submitInterviewAnswers({
      id: applicationId,
      answers,
      accessToken,
    }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      queryClient.invalidateQueries({ queryKey: ["application-details", variables.applicationId] });
      toast.success("Interview submitted successfully");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to submit interview");
    },
  });
}

export function useUpdateApplicationPersonalInfo() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: ({ applicationId, personalInfo }) => updateApplicationPersonalInfo({
      id: applicationId,
      personalInfo,
      accessToken,
    }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      queryClient.invalidateQueries({ queryKey: ["application-details", variables.applicationId] });
      toast.success("Personal info updated");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update personal info");
    },
  });
}
