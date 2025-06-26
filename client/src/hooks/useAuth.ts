import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchInterval: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    user: error ? null : user,
    isLoading,
    isAuthenticated: !!user && !error,
  };
}