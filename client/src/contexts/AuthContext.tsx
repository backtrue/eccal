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

  // Manual auth check function (only called when needed)
  const checkAuth = async () => {
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
        console.log('Auth check successful:', userData.email || userData.name || 'User logged in');
      } else {
        setUser(null);
        setIsAuthenticated(false);
        console.log('Auth check failed: User not authenticated');
      }
    } catch (error) {
      console.log('Auth check error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial check on mount - only for specific scenarios
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const currentPath = window.location.pathname;
    const isProtectedPage = ['/dashboard', '/campaign-planner', '/bdmin'].some(path => 
      currentPath.includes(path)
    );
    const isCalculatorPage = currentPath === '/calculator' || currentPath.startsWith('/calculator/');
    
    // Only check auth in these specific scenarios:
    const shouldCheckAuth = 
      urlParams.has('auth_success') ||  // Just logged in
      isProtectedPage ||                // On protected page
      isCalculatorPage;                 // On calculator page (for diagnosis feature)
    
    console.log('Auth check decision:', { 
      currentPath,
      hasAuthSuccess: urlParams.has('auth_success'), 
      isProtectedPage,
      isCalculatorPage,
      shouldCheckAuth
    });
    
    if (shouldCheckAuth) {
      console.log('Auth check triggered');
      checkAuth();
    } else {
      // Default to not authenticated without making API call
      setIsAuthenticated(false);
      setUser(null);
      console.log('Auth check skipped - not needed for current page');
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