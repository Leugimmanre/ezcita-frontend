// src/hooks/useActivity.js
import { useQuery } from "@tanstack/react-query";
import { getRecentActivity } from "@/services/activityAPI";

export function useRecentActivity(limit = 8, category = "") {
  return useQuery({
    queryKey: ["recent-activity", limit, category],
    queryFn: () => getRecentActivity(limit, category),
    staleTime: 30_000,
  });
}
