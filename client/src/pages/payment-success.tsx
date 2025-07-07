import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { Link } from "wouter";
import NavigationBar from "@/components/NavigationBar";
import Footer from "@/components/Footer";
import { getTranslations, type Locale } from "@/lib/i18n";

interface PaymentSuccessProps {
  locale: Locale;
}

export default function PaymentSuccess({ locale }: PaymentSuccessProps) {
  const [isVerifying, setIsVerifying] = useState(true);
  const t = getTranslations(locale);

  useEffect(() => {
    // Simulate verification process
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      <NavigationBar locale={locale} />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              {isVerifying ? (
                <>
                  <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-6 animate-spin" />
                  <h1 className="text-2xl font-bold mb-4">
                    {locale === 'zh-TW' ? '驗證付款中...' : locale === 'en' ? 'Verifying Payment...' : '支払いを確認中...'}
                  </h1>
                  <p className="text-gray-600">
                    {locale === 'zh-TW' 
                      ? '請稍候，我們正在處理您的付款'
                      : locale === 'en'
                      ? 'Please wait while we process your payment'
                      : 'お支払いを処理していますのでお待ちください'}
                  </p>
                </>
              ) : (
                <>
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                  <h1 className="text-3xl font-bold text-green-600 mb-4">
                    {locale === 'zh-TW' ? '付款成功！' : locale === 'en' ? 'Payment Successful!' : '支払い成功！'}
                  </h1>
                  <p className="text-gray-600 mb-6">
                    {locale === 'zh-TW' 
                      ? '恭喜您！您的會員已成功升級為 Pro 方案。現在您可以享受所有進階功能。'
                      : locale === 'en'
                      ? 'Congratulations! Your membership has been successfully upgraded to Pro. You can now enjoy all premium features.'
                      : 'おめでとうございます！メンバーシップがProに正常にアップグレードされました。すべてのプレミアム機能をお楽しみいただけます。'}
                  </p>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                      {locale === 'zh-TW' ? '現在您可以使用：' : locale === 'en' ? 'You now have access to:' : '以下の機能が利用可能になりました：'}
                    </h3>
                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <li>• {locale === 'zh-TW' ? '活動預算規劃師（無限使用）' : locale === 'en' ? 'Campaign Budget Planner (Unlimited)' : 'キャンペーン予算プランナー（無制限）'}</li>
                      <li>• {locale === 'zh-TW' ? 'FB廣告健檢專業分析' : locale === 'en' ? 'FB Ads Health Check Pro Analysis' : 'FB広告ヘルスチェック専門分析'}</li>
                      <li>• {locale === 'zh-TW' ? '高級數據分析功能' : locale === 'en' ? 'Advanced Data Analytics' : '高度なデータ分析機能'}</li>
                      <li>• {locale === 'zh-TW' ? '優先客戶支援' : locale === 'en' ? 'Priority Customer Support' : '優先カスタマーサポート'}</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <Link href={locale === 'zh-TW' ? '/dashboard' : `/${locale === 'en' ? 'en' : 'jp'}/dashboard`}>
                      <Button className="w-full">
                        {locale === 'zh-TW' ? '前往控制台' : locale === 'en' ? 'Go to Dashboard' : 'ダッシュボードへ'}
                      </Button>
                    </Link>
                    <Link href={locale === 'zh-TW' ? '/campaign-planner' : `/${locale === 'en' ? 'en' : 'jp'}/campaign-planner`}>
                      <Button variant="outline" className="w-full">
                        {locale === 'zh-TW' ? '開始活動規劃' : locale === 'en' ? 'Start Campaign Planning' : 'キャンペーン企画開始'}
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}