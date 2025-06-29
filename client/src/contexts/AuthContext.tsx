import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  checkAuth: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [shouldCheckAuth, setShouldCheckAuth] = useState(false);
  const queryClient = useQueryClient();

  // Only query when explicitly triggered
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: shouldCheckAuth, // Only when manually triggered
  });

  // Check for auth_success parameter on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth_success') === '1') {
      // User just logged in, automatically check auth status
      setShouldCheckAuth(true);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
      
      // Show success message
      setTimeout(() => {
        const event = new CustomEvent('auth-success', { 
          detail: { message: '登入成功！正在更新狀態...' } 
        });
        window.dispatchEvent(event);
      }, 100);
    }
  }, []);

  const checkAuth = () => {
    setShouldCheckAuth(true);
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}