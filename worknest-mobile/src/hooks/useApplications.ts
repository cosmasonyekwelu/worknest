import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";

export const useMyApplications = () =>
  useQuery({
    queryKey: QUERY_KEYS.applications,
    queryFn: async () => {
      const res = await api.get("/applications/me");
      return res.data?.data || [];
    },
  });

export const useApplicationDetails = (id?: string) =>
  useQuery({
    queryKey: [...QUERY_KEYS.applications, id],
    queryFn: async () => {
      const res = await api.get(`/applications/${id}`);
      return res.data?.data || res.data;
    },
    enabled: !!id,
  });

export const useApplyJob = (jobId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post(`/applications/${jobId}/apply`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.applications }),
  });
};

export const useSubmitInterview = (applicationId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (answers: Array<{ question: string; answer: string }>) => {
      const res = await api.post(`/applications/${applicationId}/submit-interview`, { answers });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.applications }),
  });
};
