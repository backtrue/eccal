import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import NavigationBar from "@/components/NavigationBar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Star, 
  Crown,
  Gift,
  Calendar,
  Infinity,
  Clock,
  Sparkles
} from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";

interface PricingProps {
  locale: Locale;
}

export default function Pricing({ locale }: PricingProps) {
  const t = getTranslations(locale);
  const { user, isAuthenticated } = useAuth();

  // 新的三方案定價結構
  const pricingData = {
    monthly: {
      twdPrice: 1280,
      priceId: 'price_monthly_1280_twd',
      popular: false,
      savings: null
    },
    annual: {
      twdPrice: 12800,
      priceId: 'price_annual_12800_twd', 
      popular: true,
      savings: '現省 2 個月費用！'
    },
    founders: {
      twdPrice: 3980,
      priceId: 'price_founders_3980_twd',
      special: true,
      oneTime: true
    }
  };

  // 三個方案的功能特色
  const monthlyFeatures = [
    '預算計算機無限使用',
    'AI 驅動 Facebook 廣告健檢', 
    '整合 Google Analytics 真實數據',
    '智慧活動優化建議',
    '專業分析報告產出'
  ];

  const annualFeatures = [
    '包含月訂閱所有功能，並升級：',
    '【Pro 限定】5 階段「活動預算規劃師」',
    '【Pro 限定】新功能優先體驗權',
    '【Pro 限定】專屬客服支援'
  ];

  const foundersFeatures = [
    '這不只是一個方案，這是一個完整的資格包：',
    '【軟體權限】「報數據」平台終身使用權',
    '【專家親授】2.5 小時直播實戰教學',
    '【完整知識庫】FB 廣告成效攻略完整線上課程',
    '【專屬身份】創始會員私密社群資格'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <NavigationBar locale={locale} />
      
      <div className="container mx-auto px-4 py-16">
        {/* 主標題 */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            加入「報數據」，選擇最適合您的方案
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            專業電商廣告分析平台，提供 AI 健檢、預算計算、活動規劃三大核心服務
          </p>
        </div>

        {/* 三個方案卡片 */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          
          {/* 方案一：月訂閱 */}
          <Card className="relative overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-all duration-300">
            <CardHeader className="text-center pt-8">
              <div className="flex justify-center mb-4">
                <Calendar className="w-12 h-12 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                月訂閱
              </CardTitle>
              <div className="mt-6">
                <div className="text-4xl font-bold text-blue-600">
                  NT${pricingData.monthly.twdPrice.toLocaleString()}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mt-2">每月</p>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-4 mb-8">
                {monthlyFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href={`${locale === 'zh-TW' ? '' : `/${locale === 'en' ? 'en' : 'jp'}`}/subscription-checkout?plan=monthly&priceId=${pricingData.monthly.priceId}`}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg">
                  開始月訂閱
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* 方案二：年訂閱（最受歡迎）*/}
          <Card className="relative overflow-hidden border-2 border-green-500 shadow-2xl transform scale-105">
            {/* 最受歡迎標籤 */}
            <div className="absolute top-0 left-0 right-0 bg-green-500 text-white text-center py-3">
              <span className="text-sm font-bold">一番人気（最受歡迎）</span>
            </div>
            <CardHeader className="text-center pt-16">
              <div className="flex justify-center mb-4">
                <Crown className="w-12 h-12 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                年訂閱
              </CardTitle>
              <div className="mt-6">
                <div className="text-4xl font-bold text-green-600">
                  NT${pricingData.annual.twdPrice.toLocaleString()}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mt-2">年費</p>
                <div className="mt-3">
                  <Badge className="bg-orange-100 text-orange-800 px-3 py-1">
                    {pricingData.annual.savings}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-4 mb-8">
                {annualFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href={`${locale === 'zh-TW' ? '' : `/${locale === 'en' ? 'en' : 'jp'}`}/subscription-checkout?plan=annual&priceId=${pricingData.annual.priceId}`}>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg">
                  選擇年訂閱
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* 方案三：創始會員方案 */}
          <Card className="relative overflow-hidden border-2 border-gradient-to-br from-yellow-400 to-orange-500 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
            {/* 特殊標籤 */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-center py-3">
              <span className="text-sm font-bold flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                僅此一次！
                <Sparkles className="w-4 h-4" />
              </span>
            </div>
            <CardHeader className="text-center pt-16">
              <div className="flex justify-center mb-4">
                <Gift className="w-12 h-12 text-orange-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                創始會員方案
                <div className="text-sm text-orange-600 font-normal mt-1">
                  (直播課限定)
                </div>
              </CardTitle>
              <div className="mt-6">
                <div className="text-4xl font-bold text-orange-600">
                  NT${pricingData.founders.twdPrice.toLocaleString()}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
                  一次性費用，非訂閱制
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-4 mb-8">
                {foundersFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href={`${locale === 'zh-TW' ? '' : `/${locale === 'en' ? 'en' : 'jp'}`}/subscription-checkout?plan=founders&priceId=${pricingData.founders.priceId}`}>
                <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold" size="lg">
                  立即鎖定創始席次
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* 額外說明區塊 */}
        <div className="mt-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              為什麼選擇「報數據」？
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  真實數據整合
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  直接串接 Google Analytics 和 Facebook API，確保分析基於真實廣告數據
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  AI 智慧分析
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  結合 GPT-4 技術，提供個人化的廣告優化建議和策略指導
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-orange-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  專家親自指導
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  小黑老師親自開發，結合多年實戰經驗的專業廣告分析工具
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 常見問題 */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            常見問題
          </h3>
          <div className="max-w-4xl mx-auto text-left">
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Q: 創始會員方案與常規訂閱有什麼不同？
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  A: 創始會員方案是限時特殊優惠，包含平台終身使用權、直播教學課程、完整知識庫以及私密社群資格。這是一次性付費，非訂閱制。
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Q: 月訂閱和年訂閱功能有差異嗎？
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  A: 年訂閱包含所有月訂閱功能，並額外提供 Pro 限定的「5 階段活動預算規劃師」、新功能優先體驗權，以及專屬客服支援。
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Q: 可以隨時取消訂閱嗎？
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  A: 是的，您可以隨時在會員中心取消訂閱。取消後將在當前計費週期結束時停止服務。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}