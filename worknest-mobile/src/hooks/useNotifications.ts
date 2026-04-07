import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { QUERY_KEYS } from "@/lib/constants";

export const useNotifications = () =>
  useQuery({
    queryKey: QUERY_KEYS.notifications,
    queryFn: async () => (await api.get("/notifications")).data?.data || [],
  });

export const useUnreadCount = () =>
  useQuery({
    queryKey: [...QUERY_KEYS.notifications, "count"],
    queryFn: async () => (await api.get("/notifications/unread-count")).data?.data?.unreadCount || 0,
  });

export const useMarkRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.patch(`/notifications/${id}/read`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.notifications }),
  });
};

export const useReadAll = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => api.patch("/notifications/read-all", {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.notifications }),
  });
};
