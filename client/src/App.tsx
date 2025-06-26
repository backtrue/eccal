import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Calculator from "@/pages/calculator";
import Dashboard from "@/pages/dashboard";
import CampaignPlanner from "@/pages/campaign-planner";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import { initMetaPixel } from "./lib/meta-pixel";

function Router() {
  // Track page views when routes change
  useAnalytics();
  
  return (
    <Switch>
      {/* Public routes - calculator accessible to everyone */}
      <Route path="/" component={() => <Calculator locale="zh-TW" />} />
      <Route path="/en" component={() => <Calculator locale="en" />} />
      <Route path="/jp" component={() => <Calculator locale="ja" />} />
      
      {/* Dashboard routes */}
      <Route path="/dashboard" component={() => <Dashboard locale="zh-TW" />} />
      <Route path="/dashboard/en" component={() => <Dashboard locale="en" />} />
      <Route path="/dashboard/jp" component={() => <Dashboard locale="ja" />} />
      
      {/* Campaign Planner routes - Pro only */}
      <Route path="/campaign-planner" component={() => <CampaignPlanner locale="zh-TW" />} />
      <Route path="/campaign-planner/en" component={() => <CampaignPlanner locale="en" />} />
      <Route path="/campaign-planner/jp" component={() => <CampaignPlanner locale="ja" />} />
      
      {/* Privacy and Terms pages */}
      <Route path="/privacy" component={() => <PrivacyPolicy locale="zh-TW" />} />
      <Route path="/privacy/en" component={() => <PrivacyPolicy locale="en" />} />
      <Route path="/privacy/jp" component={() => <PrivacyPolicy locale="ja" />} />
      <Route path="/terms" component={() => <TermsOfService locale="zh-TW" />} />
      <Route path="/terms/en" component={() => <TermsOfService locale="en" />} />
      <Route path="/terms/jp" component={() => <TermsOfService locale="ja" />} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
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