import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    staleTime: Infinity, // Never refetch automatically
    enabled: false, // Disable automatic fetching
  });

  return {
    user: null, // Always return null to prevent auth loops
    isLoading: false,
    isAuthenticated: false,
  };
}