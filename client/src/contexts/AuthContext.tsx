import { createContext, useContext, ReactNode, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface AuthContextType {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Check auth state reliably across all pages
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: (failureCount, error) => {
      // Don't retry if it's an auth error (401) - this is expected for logged out users
      if (error?.message?.includes('401') || error?.message?.includes('Not authenticated')) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnMount: true, // Always check on mount
    refetchOnReconnect: false,
    // Enable auth query in these scenarios:
    enabled: true, // Always enabled to ensure consistent auth state
    throwOnError: false, // Don't throw errors on 401 - handle gracefully
  });

  // Clean up auth_success parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('auth_success')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  return (
    <AuthContext.Provider 
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}