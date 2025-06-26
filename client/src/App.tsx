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
    } else if (location === '/') {
      // Auto-detect and redirect based on browser language
      const browserLang = navigator.language || navigator.languages?.[0] || 'zh-TW';
      if (browserLang.startsWith('en') && locale !== 'en') {
        changeLocale('en');
      } else if (browserLang.startsWith('ja') && locale !== 'ja') {
        changeLocale('ja');
      }
    }
  }, [location, locale, changeLocale]);

  return (
    <Switch>
      <Route path="/" component={() => <Home locale={locale} />} />
      <Route path="/calculator" component={() => <Calculator locale={locale} />} />
      <Route path="/campaign-planner" component={() => <CampaignPlanner locale={locale} />} />
      <Route path="/privacy" component={() => <Privacy locale={locale} />} />
      <Route path="/terms" component={() => <Terms locale={locale} />} />
      
      {/* English routes */}
      <Route path="/en" component={() => <Home locale="en" />} />
      <Route path="/en/calculator" component={() => <Calculator locale="en" />} />
      <Route path="/en/campaign-planner" component={() => <CampaignPlanner locale="en" />} />
      <Route path="/en/privacy" component={() => <Privacy locale="en" />} />
      <Route path="/en/terms" component={() => <Terms locale="en" />} />
      
      {/* Japanese routes */}
      <Route path="/jp" component={() => <Home locale="ja" />} />
      <Route path="/jp/calculator" component={() => <Calculator locale="ja" />} />
      <Route path="/jp/campaign-planner" component={() => <CampaignPlanner locale="ja" />} />
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

  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;