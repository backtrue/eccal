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
    const hasAuthSuccess = urlParams.has('auth_success') || urlParams.has('facebook_auth_success');
    
    // Only check auth in these specific scenarios:
    const shouldCheckAuth = 
      hasAuthSuccess ||  // Just logged in
      isProtectedPage ||                // On protected page
      isCalculatorPage;                 // On calculator page (for diagnosis feature)
    
    console.log('Auth check decision:', { 
      currentPath,
      hasAuthSuccess, 
      isProtectedPage,
      isCalculatorPage,
      shouldCheckAuth,
      fullURL: window.location.href
    });
    
    if (shouldCheckAuth) {
      console.log('Auth check triggered');
      
      // For auth_success, add a small delay to ensure session is established
      if (hasAuthSuccess) {
        console.log('Detected auth_success parameter, checking authentication...');
        setTimeout(() => {
          checkAuth();
        }, 500); // 500ms delay to allow session to be fully established
      } else {
        checkAuth();
      }
    } else {
      console.log('Auth check skipped - not needed for current page');
    }

    // Clean up auth_success parameter after processing
    if (hasAuthSuccess) {
      setTimeout(() => {
        window.history.replaceState({}, '', window.location.pathname);
      }, 1000); // Delay cleanup to ensure auth check completes
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