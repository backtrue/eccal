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
  // Smart auth checking: enable only when needed
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: (failureCount, error) => {
      // Don't retry if it's an auth error (401)
      if (error?.message?.includes('401')) return false;
      return failureCount < 2;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnMount: true, // Check on mount
    refetchOnReconnect: false,
    // Only enable if:
    // 1. User just logged in (auth_success param)
    // 2. We're on a protected page
    // 3. There's a stored session indication
    enabled: (() => {
      const urlParams = new URLSearchParams(window.location.search);
      const hasAuthSuccess = urlParams.has('auth_success');
      const isProtectedPage = window.location.pathname.includes('/dashboard') || 
                             window.location.pathname.includes('/campaign-planner') ||
                             window.location.pathname.includes('/bdmin');
      const hasStoredAuth = document.cookie.includes('connect.sid');
      
      console.log('Auth Query Debug:', {
        hasAuthSuccess,
        isProtectedPage,
        hasStoredAuth,
        pathname: window.location.pathname,
        enabled: hasAuthSuccess || isProtectedPage || hasStoredAuth
      });
      
      return hasAuthSuccess || isProtectedPage || hasStoredAuth;
    })(),
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