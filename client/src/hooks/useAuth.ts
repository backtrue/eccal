import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    staleTime: Infinity,
    enabled: false, // 完全停用自動查詢
  });

  return {
    user: null, // 暫時停用認證功能
    isLoading: false,
    isAuthenticated: false,
  };
}