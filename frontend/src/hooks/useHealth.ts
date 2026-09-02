import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { SystemHealth } from "@/types";

export function useHealth() {
  return useQuery<SystemHealth>({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await apiClient.get<SystemHealth>("/health");
      return response.data;
    },
  });
}
