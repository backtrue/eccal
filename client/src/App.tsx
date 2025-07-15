import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, Component, type ReactNode } from "react";
import { initGA } from "./lib/analytics";
import { initMetaPixel } from "./lib/meta-pixel";
import { useAnalytics } from "./hooks/use-analytics";
import { useLocale } from "./hooks/useLocale";
import { AuthProvider } from "./contexts/AuthContext";

// Import pages
import Home from "./pages/home";
import Calculator from "./pages/calculator-simple";
import Privacy from "./pages/privacy-policy";
import Terms from "./pages/terms-of-service";
import NotFound from "./pages/not-found";
import CampaignPlanner from "./pages/campaign-planner";
import CampaignPlannerV2 from "./pages/campaign-planner-v2";
import Dashboard from "./pages/dashboard";
import BrevoSync from "./pages/brevo-sync";
import ProjectDetail from "./pages/project-detail";
import AdminDashboard from "./pages/admin-dashboard-simple";
import DiagnosisReport from "./pages/diagnosis-report";
import DiagnosisReportDetail from "./pages/diagnosis-report-detail";
import AuthDebug from "./pages/auth-debug";
import FacebookPermissions from "./pages/facebook-permissions";
import FacebookSetup from "./pages/facebook-setup";
import FbAudit from "./pages/fbaudit";
import Pricing from "./pages/pricing";
import FbAuditHelp from "./pages/help/fbaudit-help";
import CalculatorHelp from "./pages/help/calculator-help";
import CampaignPlannerHelp from "./pages/help/campaign-planner-help";
import Checkout from "./pages/checkout";
import SubscriptionCheckout from "./pages/subscription-checkout";
import PaymentSuccess from "./pages/payment-success";
import About from "./pages/about";
import FacebookTestDemo from "./pages/facebook-test-demo";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">應用程式錯誤</h1>
            <p className="text-gray-600 mb-4">很抱歉，應用程式發生錯誤</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              重新載入頁面
            </button>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  錯誤詳情
                </summary>
                <pre className="mt-2 text-xs text-red-500 overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function Router() {
  const { locale, changeLocale } = useLocale();
  const [location] = useLocation();
  
  // Track page views when routes change
  useAnalytics();
  
  // Route-based language switching - only change if explicit language prefix is detected
  useEffect(() => {
    try {
      if (location.startsWith('/en') && locale !== 'en') {
        changeLocale('en');
      } else if (location.startsWith('/jp') && locale !== 'ja') {
        changeLocale('ja');
      } else if ((location === '/' || location.startsWith('/zh-tw')) && locale !== 'zh-TW') {
        // 確保首頁和 /zh-tw 路由預設為繁體中文
        changeLocale('zh-TW');
      }
    } catch (error) {
      console.error('Language switching error:', error);
    }
  }, [location, locale, changeLocale]);

  // Note: auth_success parameter is handled by AuthContext, don't clean it here

  return (
    <Switch>
      <Route path="/" component={() => <Home locale="zh-TW" />} />
      <Route path="/zh-tw" component={() => <Home locale="zh-TW" />} />
      <Route path="/zh-tw/calculator" component={() => <Calculator locale="zh-TW" />} />
      <Route path="/zh-tw/campaign-planner" component={() => <CampaignPlannerV2 locale="zh-TW" />} />
      <Route path="/zh-tw/fbaudit" component={() => <FbAudit locale="zh-TW" />} />
      <Route path="/zh-tw/pricing" component={() => <Pricing locale="zh-TW" />} />
      <Route path="/zh-tw/dashboard" component={() => <Dashboard locale="zh-TW" />} />
      <Route path="/zh-tw/about" component={() => <About locale="zh-TW" />} />
      <Route path="/calculator" component={() => <Calculator locale="zh-TW" />} />
      <Route path="/campaign-planner" component={() => <CampaignPlannerV2 locale="zh-TW" />} />
      <Route path="/fbaudit" component={() => <FbAudit locale="zh-TW" />} />
      <Route path="/pricing" component={() => <Pricing locale="zh-TW" />} />
      <Route path="/checkout" component={() => <Checkout locale="zh-TW" />} />
      <Route path="/subscription-checkout" component={() => <SubscriptionCheckout locale="zh-TW" />} />
      <Route path="/payment-success" component={() => <PaymentSuccess locale="zh-TW" />} />
      <Route path="/help/fbaudit" component={() => <FbAuditHelp locale="zh-TW" />} />
      <Route path="/help/calculator" component={() => <CalculatorHelp locale="zh-TW" />} />
      <Route path="/help/campaign-planner" component={() => <CampaignPlannerHelp locale="zh-TW" />} />
      <Route path="/dashboard" component={() => <Dashboard locale="zh-TW" />} />
      <Route path="/project/:id" component={ProjectDetail} />
      <Route path="/diagnosis-report/:id" component={DiagnosisReportDetail} />
      <Route path="/bdmin" component={() => (
        <ProtectedAdminRoute>
          <AdminDashboard />
        </ProtectedAdminRoute>
      )} />
      <Route path="/brevo-sync" component={() => <BrevoSync />} />
      <Route path="/facebook-permissions" component={() => <FacebookPermissions />} />
      <Route path="/facebook-setup" component={() => <FacebookSetup locale="zh-TW" />} />
      <Route path="/privacy-policy" component={() => <Privacy locale="zh-TW" />} />
      <Route path="/terms-of-service" component={() => <Terms locale="zh-TW" />} />
      <Route path="/privacy" component={() => <Privacy locale="zh-TW" />} />
      <Route path="/terms" component={() => <Terms locale="zh-TW" />} />
      <Route path="/about" component={() => <About locale="zh-TW" />} />
      <Route path="/facebook-test-demo" component={() => <FacebookTestDemo locale="zh-TW" />} />
      
      {/* English routes */}
      <Route path="/en" component={() => <Home locale="en" />} />
      <Route path="/en/calculator" component={() => <Calculator locale="en" />} />
      <Route path="/en/campaign-planner" component={() => <CampaignPlannerV2 locale="en" />} />
      <Route path="/en/fbaudit" component={() => <FbAudit locale="en" />} />
      <Route path="/en/pricing" component={() => <Pricing locale="en" />} />
      <Route path="/en/checkout" component={() => <Checkout locale="en" />} />
      <Route path="/en/subscription-checkout" component={() => <SubscriptionCheckout locale="en" />} />
      <Route path="/en/payment-success" component={() => <PaymentSuccess locale="en" />} />
      <Route path="/en/help/fbaudit" component={() => <FbAuditHelp locale="en" />} />
      <Route path="/en/help/calculator" component={() => <CalculatorHelp locale="en" />} />
      <Route path="/en/help/campaign-planner" component={() => <CampaignPlannerHelp locale="en" />} />
      <Route path="/en/dashboard" component={() => <Dashboard locale="en" />} />
      <Route path="/en/brevo-sync" component={() => <BrevoSync />} />
      <Route path="/en/facebook-setup" component={() => <FacebookSetup locale="en" />} />
      <Route path="/en/privacy-policy" component={() => <Privacy locale="en" />} />
      <Route path="/en/terms-of-service" component={() => <Terms locale="en" />} />
      <Route path="/en/privacy" component={() => <Privacy locale="en" />} />
      <Route path="/en/terms" component={() => <Terms locale="en" />} />
      <Route path="/en/about" component={() => <About locale="en" />} />
      
      {/* Japanese routes */}
      <Route path="/jp" component={() => <Home locale="ja" />} />
      <Route path="/jp/calculator" component={() => <Calculator locale="ja" />} />
      <Route path="/jp/campaign-planner" component={() => <CampaignPlannerV2 locale="ja" />} />
      <Route path="/jp/fbaudit" component={() => <FbAudit locale="ja" />} />
      <Route path="/jp/pricing" component={() => <Pricing locale="ja" />} />
      <Route path="/jp/checkout" component={() => <Checkout locale="ja" />} />
      <Route path="/jp/subscription-checkout" component={() => <SubscriptionCheckout locale="ja" />} />
      <Route path="/jp/payment-success" component={() => <PaymentSuccess locale="ja" />} />
      <Route path="/jp/help/fbaudit" component={() => <FbAuditHelp locale="ja" />} />
      <Route path="/jp/help/calculator" component={() => <CalculatorHelp locale="ja" />} />
      <Route path="/jp/help/campaign-planner" component={() => <CampaignPlannerHelp locale="ja" />} />
      <Route path="/jp/dashboard" component={() => <Dashboard locale="ja" />} />
      <Route path="/jp/brevo-sync" component={() => <BrevoSync />} />
      <Route path="/jp/facebook-setup" component={() => <FacebookSetup locale="ja" />} />
      <Route path="/jp/privacy-policy" component={() => <Privacy locale="ja" />} />
      <Route path="/jp/terms-of-service" component={() => <Terms locale="ja" />} />
      <Route path="/jp/privacy" component={() => <Privacy locale="ja" />} />
      <Route path="/jp/terms" component={() => <Terms locale="ja" />} />
      <Route path="/jp/about" component={() => <About locale="ja" />} />
      
      {/* Debug routes */}
      <Route path="/auth-debug" component={() => <AuthDebug />} />
      
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

  // Minimal auth success handling to reduce complexity
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('auth_success')) {
      // Clean URL immediately
      window.history.replaceState({}, '', window.location.pathname);
      // No need to refresh auth state - hooks will handle it automatically
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;