import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import NavigationBar from "@/components/NavigationBar";
import Footer from "@/components/Footer";
import FacebookLoginButton from "@/components/FacebookLoginButton";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  Target, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Facebook,
  Eye,
  Lock,
  UserCheck,
  ExternalLink,
  Play,
  ArrowRight
} from "lucide-react";
import type { Locale } from "@/lib/i18n";

interface FacebookTestDemoProps {
  locale: Locale;
}

export default function FacebookTestDemo({ locale }: FacebookTestDemoProps) {
  const { user, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "1. Access Test Page",
      description: "Visit Facebook Ad Health Check test demonstration",
      action: "Visit Page",
      status: "completed"
    },
    {
      id: 2,
      title: "2. Google Login",
      description: "Complete Google OAuth authentication (required for user identity)",
      action: "Google Login",
      status: isAuthenticated ? "completed" : "pending"
    },
    {
      id: 3,
      title: "3. Facebook Authorization",
      description: "🔍 IMPORTANT: Watch for privacy policy display in Facebook OAuth dialog",
      action: "Facebook Authorization",
      status: user?.metaAccessToken ? "completed" : "pending"
    },
    {
      id: 4,
      title: "4. Permission Verification",
      description: "Confirm app received necessary permissions (ads_read, ads_management)",
      action: "Check Permissions",
      status: user?.metaAccessToken ? "completed" : "pending"
    },
    {
      id: 5,
      title: "5. Ad Account Selection",
      description: "Select Facebook ad account for analysis",
      action: "Select Account",
      status: "pending"
    },
    {
      id: 6,
      title: "6. Start Health Check",
      description: "Execute Facebook advertising data analysis",
      action: "Start Analysis",
      status: "pending"
    }
  ];

  const permissions = [
    {
      name: "ads_read",
      description: "Read advertising data",
      purpose: "Analyze ad performance and generate diagnostic reports",
      examples: [
        "Read advertising account list",
        "Retrieve advertising campaign data",
        "Analyze click-through rates and conversion rates",
        "Calculate ROAS (Return on Ad Spend)"
      ]
    },
    {
      name: "ads_management",
      description: "Advertising account management",
      purpose: "Access detailed advertising account information",
      examples: [
        "Retrieve detailed advertising account information",
        "Read ad groups and creative materials",
        "Analyze advertising placement settings",
        "Provide optimization recommendations"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar locale={locale} />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 頁面標題 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Facebook App Review Test Demo</h1>
          <p className="text-gray-600 mb-6">
            This page provides a complete end-to-end testing flow demonstration for the Facebook App Review Team
          </p>
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <strong>For Meta App Reviewers:</strong><br />
              This app requires ads_read and ads_management permissions for Facebook advertising health check services.
              Please follow the steps below to complete testing. For any questions, contact: backtrue@thinkwithblack.com
              <br /><br />
              <strong>📋 Privacy Policy Notice:</strong> During Facebook login, you will see our privacy policy link displayed in the OAuth dialog.
              Privacy Policy URL: <a href="https://thinkwithblack.com/privacy" target="_blank" className="text-blue-600 underline font-medium">https://thinkwithblack.com/privacy</a>
            </AlertDescription>
          </Alert>
        </div>

        {/* Permission Usage Explanation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Facebook Permission Usage Explanation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Important Notice for Reviewers:</strong> Our application only performs READ operations on Facebook advertising data. 
                We never modify, create, or delete any advertising content or settings. All permissions are used solely for data analysis and reporting purposes.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {permissions.map((permission) => (
                <div key={permission.name} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 text-blue-600">{permission.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{permission.description}</p>
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">Purpose:</span>
                    <p className="text-sm text-gray-600">{permission.purpose}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Specific Usage:</span>
                    <ul className="text-sm text-gray-600 mt-1">
                      {permission.examples.map((example, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Testing Process */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              End-to-End Testing Process
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    {step.status === "completed" ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : step.status === "pending" ? (
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-500">{step.id}</span>
                      </div>
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                    
                    {step.id === 2 && !isAuthenticated && (
                      <GoogleLoginButton 
                        locale={locale}
                        returnTo="/facebook-test-demo"
                        className="bg-blue-600 hover:bg-blue-700"
                      />
                    )}
                    
                    {step.id === 3 && isAuthenticated && !user?.metaAccessToken && (
                      <div className="space-y-3">
                        <Alert className="border-red-200 bg-red-50">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-800">
                            <strong>🔍 FOR META REVIEWERS - PRIVACY POLICY VERIFICATION:</strong><br />
                            Clicking the button below will open the Facebook login dialog. <strong>Please verify that our privacy policy link is displayed in the OAuth dialog.</strong><br />
                            Privacy Policy URL: <span className="font-mono text-sm bg-white px-2 py-1 rounded">https://thinkwithblack.com/privacy</span><br />
                            This demonstrates compliance with Meta Platform Policy Section 4.a - Privacy Policy requirements.
                          </AlertDescription>
                        </Alert>
                        <div className="border-2 border-dashed border-blue-300 p-4 rounded-lg bg-blue-50">
                          <FacebookLoginButton />
                          <p className="text-xs text-blue-600 mt-2">
                            ⚠️ The Facebook OAuth dialog will include our privacy policy link, meeting Meta Platform Policy requirements
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {step.id === 4 && user?.metaAccessToken && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Facebook Authorization Successful</span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          Application has obtained necessary permissions and can perform advertising data analysis
                        </p>
                      </div>
                    )}
                    
                    {step.id === 5 && user?.metaAccessToken && (
                      <Button 
                        onClick={() => window.location.href = '/fbaudit'}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Go to Ad Health Check <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Privacy Policy and Security */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Privacy Policy & Data Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>✅ Meta Platform Policy Compliance:</strong> Our application fully complies with Meta Platform Policy Section 4.a regarding privacy policy requirements. 
                The privacy policy is publicly accessible and clearly explains our data collection, usage, and protection practices.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 p-3 rounded-lg mb-3 inline-block">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Data Transparency</h3>
                <p className="text-sm text-gray-600">
                  Clear explanation of what data is collected and how it's used
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-lg mb-3 inline-block">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Security Protection</h3>
                <p className="text-sm text-gray-600">
                  Industry-standard encryption and security measures
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 p-3 rounded-lg mb-3 inline-block">
                  <UserCheck className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">User Control</h3>
                <p className="text-sm text-gray-600">
                  Users can revoke permissions or request data deletion anytime
                </p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-3">Related Links (For Reviewers)</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" onClick={() => window.open('https://thinkwithblack.com/privacy', '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Privacy Policy
                </Button>
                <Button variant="outline" onClick={() => window.open('https://thinkwithblack.com/terms', '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Terms of Service
                </Button>
                <Button variant="outline" onClick={() => window.open('/api/facebook/data-deletion', '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Data Deletion Endpoint
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 聯絡資訊 */}
        <Card>
          <CardHeader>
            <CardTitle>聯絡資訊</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">技術支援</h3>
              <p className="text-sm text-gray-600 mb-2">
                如果您在測試過程中遇到任何問題，請聯絡我們：
              </p>
              <div className="text-sm">
                <p><strong>公司：</strong>煜言顧問有限公司</p>
                <p><strong>信箱：</strong>backtrue@thinkwithblack.com</p>
                <p><strong>網站：</strong>https://thinkwithblack.com</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}