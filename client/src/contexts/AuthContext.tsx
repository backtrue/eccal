import { createContext, useContext, ReactNode, useEffect, useState } from "react";

interface AuthContextType {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
  loginSource: 'google' | 'facebook' | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  checkAuth: async () => {},
  loginSource: null,
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginSource, setLoginSource] = useState<'google' | 'facebook' | null>(null);

  // Manual auth check function (only called when needed)
  const checkAuth = async () => {
    setIsLoading(true);
    try {
      console.log('AuthContext: Starting auth check...');
      
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      console.log('AuthContext: Auth response status:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('AuthContext: User data received:', { email: userData.email, id: userData.id });
        setUser(userData);
        setIsAuthenticated(true);
        
        // 判斷登入來源
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('facebook_auth_success')) {
          setLoginSource('facebook');
          console.log('Facebook login successful:', userData.email || userData.name || 'User logged in');
        } else if (urlParams.has('auth_success')) {
          setLoginSource('google');
          console.log('Google login successful:', userData.email || userData.name || 'User logged in');
        } else {
          // 基於用戶資料判斷登入來源
          if (userData.metaAccessToken) {
            setLoginSource('facebook');
          } else {
            setLoginSource('google');
          }
          console.log('Auth check successful:', userData.email || userData.name || 'User logged in');
        }
      } else {
        const errorText = await response.text();
        console.log('AuthContext: Auth check failed:', response.status, errorText);
        setUser(null);
        setIsAuthenticated(false);
        setLoginSource(null);
      }
    } catch (error) {
      console.log('AuthContext: Auth check error:', error);
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
    const isFbAuditPage = currentPath === '/fbaudit' || currentPath.includes('/fbaudit');
    const isFacebookTestPage = currentPath === '/facebook-test-demo' || currentPath.includes('/facebook-test-demo');
    const hasAuthSuccess = urlParams.has('auth_success') || urlParams.has('facebook_auth_success');
    
    // Only check auth in these specific scenarios:
    const shouldCheckAuth = 
      hasAuthSuccess ||  // Just logged in
      isProtectedPage ||                // On protected page
      isCalculatorPage ||               // On calculator page (for diagnosis feature)
      isFbAuditPage ||                 // On FB audit page (needs auth for account access)
      isFacebookTestPage;              // On Facebook test demo page (needs auth for testing)
    
    console.log('Auth check decision:', { 
      currentPath,
      hasAuthSuccess, 
      isProtectedPage,
      isCalculatorPage,
      isFbAuditPage,
      isFacebookTestPage,
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
        loginSource,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}