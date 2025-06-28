import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { initGA } from "./lib/analytics";
import { initMetaPixel } from "./lib/meta-pixel";
import { useAnalytics } from "./hooks/use-analytics";
import { useLocale } from "./hooks/useLocale";

// Import pages
import Home from "./pages/home";
import Calculator from "./pages/calculator";
import Privacy from "./pages/privacy-policy";
import Terms from "./pages/terms-of-service";
import NotFound from "./pages/not-found";
import CampaignPlanner from "./pages/campaign-planner";
import Dashboard from "./pages/dashboard";
import BrevoSync from "./pages/brevo-sync";
import ProjectDetail from "./pages/project-detail";

function Router() {
  const { locale, changeLocale } = useLocale();
  const [location] = useLocation();
  
  // Track page views when routes change
  useAnalytics();
  
  // Handle route-based language switching
  useEffect(() => {
    if (location.startsWith('/en')) {
      if (locale !== 'en') changeLocale('en');
    } else if (location.startsWith('/jp')) {
      if (locale !== 'ja') changeLocale('ja');
    } else if (location === '/' && locale === 'zh-TW') {
      // Default route for Traditional Chinese
    } else if (location === '/' && locale !== 'zh-TW') {
      // Force Traditional Chinese as default for homepage
      changeLocale('zh-TW');
    }
  }, [location, locale, changeLocale]);

  return (
    <Switch>
      <Route path="/" component={() => <Home locale={locale} />} />
      <Route path="/calculator" component={() => <Calculator locale={locale} />} />
      <Route path="/campaign-planner" component={() => <CampaignPlanner locale={locale} />} />
      <Route path="/dashboard" component={() => <Dashboard locale={locale} />} />
      <Route path="/project/:id" component={ProjectDetail} />
      <Route path="/brevo-sync" component={() => <BrevoSync />} />
      <Route path="/privacy" component={() => <Privacy locale={locale} />} />
      <Route path="/terms" component={() => <Terms locale={locale} />} />
      
      {/* English routes */}
      <Route path="/en" component={() => <Home locale="en" />} />
      <Route path="/en/calculator" component={() => <Calculator locale="en" />} />
      <Route path="/en/campaign-planner" component={() => <CampaignPlanner locale="en" />} />
      <Route path="/en/dashboard" component={() => <Dashboard locale="en" />} />
      <Route path="/en/brevo-sync" component={() => <BrevoSync />} />
      <Route path="/en/privacy" component={() => <Privacy locale="en" />} />
      <Route path="/en/terms" component={() => <Terms locale="en" />} />
      
      {/* Japanese routes */}
      <Route path="/jp" component={() => <Home locale="ja" />} />
      <Route path="/jp/calculator" component={() => <Calculator locale="ja" />} />
      <Route path="/jp/campaign-planner" component={() => <CampaignPlanner locale="ja" />} />
      <Route path="/jp/dashboard" component={() => <Dashboard locale="ja" />} />
      <Route path="/jp/brevo-sync" component={() => <BrevoSync />} />
      <Route path="/jp/privacy" component={() => <Privacy locale="ja" />} />
      <Route path="/jp/terms" component={() => <Terms locale="ja" />} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize tracking
  useEffect(() => {
    if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
      initGA();
    }
    if (import.meta.env.VITE_META_PIXEL_ID) {
      initMetaPixel();
    }
  }, []);

  // Handle authentication state refresh after OAuth login
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('auth_success')) {
      // Clear the auth_success parameter from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      // Force immediate auth state refresh
      queryClient.removeQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Force a page reload to ensure clean state
      setTimeout(() => {
        const returnTo = sessionStorage.getItem('returnTo');
        sessionStorage.removeItem('returnTo');
        window.location.href = returnTo || '/';
      }, 100);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;