import { createContext, useContext, ReactNode, useEffect, useState } from "react";

interface AuthContextType {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  checkAuth: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if session cookie exists (lightweight check)
  const hasSessionCookie = () => {
    return document.cookie.includes('connect.sid=');
  };

  // Manual auth check function (only called when needed)
  const checkAuth = async () => {
    if (!hasSessionCookie()) {
      setUser(null);
      setIsAuthenticated(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial check on mount and auth_success parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isProtectedPage = ['/dashboard', '/campaign-planner', '/bdmin'].some(path => 
      window.location.pathname.includes(path)
    );
    
    // Only check auth in these scenarios:
    if (urlParams.has('auth_success') || isProtectedPage || hasSessionCookie()) {
      checkAuth();
    } else {
      // No session cookie and not a protected page = not authenticated
      setIsAuthenticated(false);
      setUser(null);
    }

    // Clean up auth_success parameter
    if (urlParams.has('auth_success')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  return (
    <AuthContext.Provider 
      value={{
        user,
        isLoading,
        isAuthenticated,
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