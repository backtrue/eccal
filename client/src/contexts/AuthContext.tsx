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
  // Always check authentication status
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: (failureCount, error) => {
      // Don't retry if it's an auth error (401)
      if (error?.message?.includes('401')) return false;
      return failureCount < 1;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    // Always enabled to properly detect auth state
    enabled: true,
  });

  console.log('[AUTH CONTEXT] Query state:', { user: !!user, isLoading, error: !!error });

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