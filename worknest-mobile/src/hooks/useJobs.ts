import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import api from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";

export function useJobs(keyword: string) {
  const [debounced] = useDebounce(keyword, 400);
  return useQuery({
    queryKey: [...QUERY_KEYS.jobs, debounced],
    queryFn: async () => {
      const res = await api.get("/jobs/all");
      const jobs = res.data?.data || [];
      if (!debounced) return jobs;
      const q = debounced.toLowerCase();
      return jobs.filter((job: any) =>
        [job.title, job.companyName, job.location].some((v) => String(v || "").toLowerCase().includes(q))
      );
    },
  });
}

export const useJobDetails = (id?: string) =>
  useQuery({
    queryKey: [...QUERY_KEYS.jobs, id],
    queryFn: async () => {
      const res = await api.get(`/jobs/${id}`);
      return res.data?.data || res.data;
    },
    enabled: !!id,
  });

export function useSavedJobs() {
  return useQuery({
    queryKey: QUERY_KEYS.savedJobs,
    queryFn: async () => {
      const res = await api.get("/jobs/saved");
      return res.data?.data || [];
    },
  });
}

export function useToggleSaveJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ jobId, isSaved }: { jobId: string; isSaved: boolean }) => {
      if (isSaved) {
        await api.delete(`/jobs/${jobId}/save`);
      } else {
        await api.post(`/jobs/${jobId}/save`, {});
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobs });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.savedJobs });
    },
  });
}
