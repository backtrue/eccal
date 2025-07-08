import { useState, useEffect } from "react";
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, User, Calendar, CreditCard } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
// Removed usePricing import - using simple JPY pricing
import NavigationBar from "@/components/NavigationBar";
import Footer from "@/components/Footer";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { getTranslations, type Locale } from "@/lib/i18n";

// Load Stripe
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface SubscriptionCheckoutProps {
  locale: Locale;
}

interface CheckoutFormProps {
  locale: Locale;
  planType: 'monthly' | 'lifetime';
  priceId: string;
}

// Price IDs are now dynamically fetched based on user locale

const CheckoutForm = ({ locale, planType, priceId }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  // 使用簡單的日圓定價數據
  const pricingData = {
    monthly: {
      jpyPrice: 2000,
      priceId: 'price_0RiHY9YDQY3sAQESGLKwBfNm',
      credits: 350
    },
    lifetime: {
      jpyPrice: 17250,
      priceId: 'price_0RiHY9YDQY3sAQESlN1UPzu0',
      credits: 700
    }
  };

  const t = getTranslations(locale);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?plan=${planType}`,
        },
      });

      if (error) {
        console.error('Payment confirmation error:', error);
        setPaymentStatus('error');
        toast({
          title: t.checkout.paymentError,
          description: error.message || t.checkout.paymentErrorDesc,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      toast({
        title: t.checkout.paymentError,
        description: t.checkout.paymentErrorDesc,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-700"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t.checkout.processing}
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            {planType === 'monthly' ? t.checkout.subscribeMonthly : t.checkout.payLifetime}
          </>
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        {t.checkout.securePayment}
      </p>
    </form>
  );
};

export default function SubscriptionCheckout({ locale }: SubscriptionCheckoutProps) {
  const { user, isAuthenticated } = useAuth();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planType, setPlanType] = useState<'monthly' | 'lifetime'>('monthly');
  const [priceId, setPriceId] = useState<string>('');
  // 使用簡單的日圓定價數據
  const pricingData = {
    monthly: {
      jpyPrice: 2000,
      priceId: 'price_0RiHY9YDQY3sAQESGLKwBfNm',
      credits: 350
    },
    lifetime: {
      jpyPrice: 17250,
      priceId: 'price_0RiHY9YDQY3sAQESlN1UPzu0',
      credits: 700
    }
  };

  const t = getTranslations(locale);

  useEffect(() => {
    // Get plan type from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan') as 'monthly' | 'lifetime';
    const price = urlParams.get('priceId');
    
    if (plan) {
      setPlanType(plan);
    }
    
    if (price) {
      setPriceId(price);
    } else {
      setPriceId(pricingData[plan]?.priceId || pricingData.monthly.priceId);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !priceId) {
      setLoading(false);
      return;
    }

    // Create subscription
    const createSubscription = async () => {
      try {
        setLoading(true);
        const response = await apiRequest("POST", "/api/stripe/create-subscription", {
          priceId,
          planType
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create subscription');
        }

        const data = await response.json();
        
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error('No client secret received');
        }
      } catch (err: any) {
        console.error('Error creating subscription:', err);
        setError(err.message || 'Failed to create subscription');
        toast({
          title: t.checkout.subscriptionError,
          description: err.message || t.checkout.subscriptionErrorDesc,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    createSubscription();
  }, [isAuthenticated, priceId, planType, t, toast]);

  // 使用簡單的日圓定價數據
  const planDetails = {
    monthly: {
      name: t.pricing.monthlyPlan,
      price: `¥${pricingData.monthly.jpyPrice.toLocaleString()}`,
      period: t.pricing.perMonth,
      icon: Calendar,
      features: [
        t.pricing.features.allFeatures,
        t.pricing.features.prioritySupport,
        t.pricing.features.monthlyCredits,
        t.pricing.features.advancedAnalytics
      ]
    },
    lifetime: {
      name: t.pricing.lifetimePlan,
      price: `¥${pricingData.lifetime.jpyPrice.toLocaleString()}`,
      period: t.pricing.oneTime,
      icon: CreditCard,
      features: [
        t.pricing.features.allFeatures,
        t.pricing.features.lifetimeAccess,
        t.pricing.features.prioritySupport,
        t.pricing.features.unlimitedCredits
      ]
    }
  };

  // 簡化的加載狀態檢查
  if (!priceId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <NavigationBar locale={locale} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading pricing information...</p>
          </div>
        </div>
        <Footer locale={locale} />
      </div>
    );
  }

  const currentPlan = planDetails[planType];
  const IconComponent = currentPlan.icon;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <NavigationBar locale={locale} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <User className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                <CardTitle>{t.checkout.loginRequired}</CardTitle>
                <CardDescription>
                  {t.checkout.loginRequiredDesc}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GoogleLoginButton locale={locale} />
                <div className="mt-4 text-center">
                  <Link href={`${locale === 'zh-TW' ? '' : `/${locale === 'en' ? 'en' : 'jp'}`}/pricing`}>
                    <Button variant="ghost" size="sm">
                      {t.checkout.backToPricing}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer locale={locale} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <NavigationBar locale={locale} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t.checkout.preparingPayment}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer locale={locale} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <NavigationBar locale={locale} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <XCircle className="w-12 h-12 mx-auto text-red-600 mb-4" />
                <CardTitle className="text-red-600">{t.checkout.subscriptionError}</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <Link href={`${locale === 'zh-TW' ? '' : `/${locale === 'en' ? 'en' : 'jp'}`}/pricing`}>
                    <Button className="w-full">
                      {t.checkout.backToPricing}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer locale={locale} />
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <NavigationBar locale={locale} />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>{t.checkout.preparingPayment}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer locale={locale} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <NavigationBar locale={locale} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t.checkout.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {t.checkout.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Plan Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <IconComponent className="w-8 h-8 text-blue-600" />
                  <div>
                    <CardTitle className="text-xl">{currentPlan.name}</CardTitle>
                    <CardDescription>
                      {currentPlan.price} {currentPlan.period}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{t.checkout.user}:</span>
                    <span>{user?.email}</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <h4 className="font-medium mb-2">{t.checkout.planFeatures}:</h4>
                    <ul className="space-y-1">
                      {currentPlan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {planType === 'monthly' && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {t.checkout.recurringBilling}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  {t.checkout.paymentMethod}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Elements 
                  stripe={stripePromise} 
                  options={{ 
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#2563eb',
                      }
                    }
                  }}
                >
                  <CheckoutForm 
                    locale={locale} 
                    planType={planType} 
                    priceId={priceId}
                  />
                </Elements>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Link href={`${locale === 'zh-TW' ? '' : `/${locale === 'en' ? 'en' : 'jp'}`}/pricing`}>
              <Button variant="ghost">
                {t.checkout.backToPricing}
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer locale={locale} />
    </div>
  );
}