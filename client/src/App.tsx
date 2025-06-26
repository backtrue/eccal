import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Calculator from "@/pages/calculator";
import Dashboard from "@/pages/dashboard";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import { initMetaPixel } from "./lib/meta-pixel";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getBrowserLocale } from "./lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

function Router() {
  // Track page views when routes change
  useAnalytics();
  const [location, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  
  // Auto-redirect based on browser language
  useEffect(() => {
    if (location === "/") {
      const browserLocale = getBrowserLocale();
      if (browserLocale === 'en') {
        setLocation('/en');
      } else if (browserLocale === 'ja') {
        setLocation('/jp');
      }
      // Default to zh-TW (no redirect needed for /)
    }
  }, [location, setLocation]);

  // Process referral on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref');
    
    if (referralCode && isAuthenticated && user) {
      // Process referral
      fetch('/api/referral/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referralCode,
          userId: user.id,
        }),
      }).catch(console.error);
      
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete('ref');
      window.history.replaceState({}, '', url.toString());
    }
  }, [isAuthenticated, user]);
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with Language Switcher */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-gray-900">報數據</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated && (
                <div className="flex items-center space-x-4">
                  <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">
                    會員後台
                  </Link>
                  <div className="text-sm text-gray-600">
                    Credits: {user?.credits?.balance || 0}
                  </div>
                </div>
              )}
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <Switch>
          <Route path="/" component={() => <Calculator locale="zh-TW" />} />
          <Route path="/en" component={() => <Calculator locale="en" />} />
          <Route path="/jp" component={() => <Calculator locale="ja" />} />
          <Route path="/dashboard" component={() => <Dashboard locale="zh-TW" />} />
          <Route path="/en/dashboard" component={() => <Dashboard locale="en" />} />
          <Route path="/jp/dashboard" component={() => <Dashboard locale="ja" />} />
          <Route path="/privacy-policy" component={() => <PrivacyPolicy locale="zh-TW" />} />
          <Route path="/en/privacy-policy" component={() => <PrivacyPolicy locale="en" />} />
          <Route path="/jp/privacy-policy" component={() => <PrivacyPolicy locale="ja" />} />
          <Route path="/terms-of-service" component={() => <TermsOfService locale="zh-TW" />} />
          <Route path="/en/terms-of-service" component={() => <TermsOfService locale="en" />} />
          <Route path="/jp/terms-of-service" component={() => <TermsOfService locale="ja" />} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  // Initialize tracking when app loads
  useEffect(() => {
    // Verify required environment variables are present
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }

    if (!import.meta.env.VITE_META_PIXEL_ID) {
      console.warn('Missing required Meta Pixel key: VITE_META_PIXEL_ID');
    } else {
      initMetaPixel();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;