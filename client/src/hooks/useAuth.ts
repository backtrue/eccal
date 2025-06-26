import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 10 * 60 * 1000, // 延長到10分鐘
    gcTime: 15 * 60 * 1000, // 15分鐘快取
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnMount: false, // 只在必要時查詢
    refetchOnReconnect: false,
    enabled: true, // 只執行一次初始查詢
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}