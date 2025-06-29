import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

interface AuthContextType {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 15 * 60 * 1000, // 15分鐘不重新請求
    gcTime: 30 * 60 * 1000, // 30分鐘快取
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: true,
  });

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