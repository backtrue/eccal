import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5分鐘內不重新請求
    refetchOnWindowFocus: false, // 減少不必要的重新請求
    refetchInterval: false, // 停用自動刷新
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}