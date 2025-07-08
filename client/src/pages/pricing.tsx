import { useState } from "react";
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
  Zap, 
  Target, 
  TrendingUp, 
  Clock, 
  Crown,
  Gift,
  Users,
  BarChart3,
  Shield,
  Sparkles
} from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";
import CurrencyConverter from "@/components/CurrencyConverter";

interface PricingProps {
  locale: Locale;
}

export default function Pricing({ locale }: PricingProps) {
  const t = getTranslations(locale);
  const { user, isAuthenticated } = useAuth();
  const [billingType, setBillingType] = useState<'monthly' | 'lifetime'>('monthly');

  // 簡單的日圓定價數據
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

  const whyFeatures = [
    {
      icon: <Target className="w-6 h-6 text-blue-600" />,
      title: locale === 'ja' ? '精確な予算計算' : locale === 'en' ? 'Precise Budget Calculation' : '精準預算計算',
      description: locale === 'ja' ? 'Google Analytics連携で実データに基づいた広告予算を自動計算' : locale === 'en' ? 'Automatic ad budget calculation based on real data via Google Analytics integration' : '整合Google Analytics真實數據自動計算廣告預算'
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-green-600" />,
      title: locale === 'ja' ? 'Facebook広告診断' : locale === 'en' ? 'Facebook Ads Health Check' : 'Facebook廣告健檢',
      description: locale === 'ja' ? 'AIによる広告アカウントの詳細分析と改善提案' : locale === 'en' ? 'Detailed ad account analysis and improvement suggestions by AI' : 'AI深度分析廣告帳戶並提供改善建議'
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      title: locale === 'ja' ? 'キャンペーン最適化' : locale === 'en' ? 'Campaign Optimization' : '活動優化建議',
      description: locale === 'ja' ? '業界データと比較した最適化戦略の提案' : locale === 'en' ? 'Optimization strategies based on industry data comparison' : '基於行業數據比較的最佳化策略建議'
    },
    {
      icon: <Shield className="w-6 h-6 text-orange-600" />,
      title: locale === 'ja' ? '専門的な分析' : locale === 'en' ? 'Professional Analysis' : '專業分析報告',
      description: locale === 'ja' ? '小黒先生による専門的な広告分析とアドバイス' : locale === 'en' ? 'Professional ad analysis and advice by Teacher Black' : '小黑老師專業廣告分析與建議'
    }
  ];

  const monthlyFeatures = [
    locale === 'ja' ? '月350クレジット付与' : locale === 'en' ? '350 credits monthly' : '每月贈送350點數',
    locale === 'ja' ? '予算計算機無制限使用' : locale === 'en' ? 'Unlimited budget calculator' : '預算計算機無限使用',
    locale === 'ja' ? 'Facebook広告診断' : locale === 'en' ? 'Facebook ads health check' : 'Facebook廣告健檢',
    locale === 'ja' ? '業界比較分析' : locale === 'en' ? 'Industry comparison analysis' : '行業比較分析',
    locale === 'ja' ? 'AIによる改善提案' : locale === 'en' ? 'AI improvement suggestions' : 'AI改善建議',
    locale === 'ja' ? '基本レポート機能' : locale === 'en' ? 'Basic reporting features' : '基本報告功能'
  ];

  const lifetimeFeatures = [
    locale === 'ja' ? '月700クレジット付与' : locale === 'en' ? '700 credits monthly' : '每月贈送700點數',
    locale === 'ja' ? '新機能優先アクセス' : locale === 'en' ? 'Priority access to new features' : '新功能優先使用',
    locale === 'ja' ? 'クレジット使用特別割引' : locale === 'en' ? 'Special discount on credit usage' : '點數使用特別折扣',
    locale === 'ja' ? '高度な分析機能' : locale === 'en' ? 'Advanced analytics features' : '高級分析功能',
    locale === 'ja' ? '専用サポート' : locale === 'en' ? 'Dedicated support' : '專屬客服支援',
    locale === 'ja' ? '全機能無制限使用' : locale === 'en' ? 'Unlimited access to all features' : '全功能無限使用'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar locale={locale} />
      
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {locale === 'ja' ? '報數據プレミアム' : locale === 'en' ? 'Report Data Premium' : '報數據 Premium'}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {locale === 'ja' ? '広告投資を最大化する、プロレベルの分析ツール' : locale === 'en' ? 'Professional-grade analytics tools to maximize your ad investment' : '專業級分析工具，最大化您的廣告投資回報'}
          </p>
          <div className="flex justify-center items-center gap-4 mb-8">
            <Badge variant="secondary" className="bg-red-100 text-red-800 px-4 py-2">
              <Clock className="w-4 h-4 mr-2" />
              {locale === 'ja' ? '限定セール中' : locale === 'en' ? 'Limited Time Sale' : '限時特價中'}
            </Badge>
          </div>
        </div>

        {/* Section 1: Why - 為什麼要買報數據的服務 */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {locale === 'ja' ? 'なぜ報數據を選ぶのか？' : locale === 'en' ? 'Why Choose Report Data?' : '為什麼選擇報數據？'}
            </h2>
            <p className="text-gray-600 text-lg">
              {locale === 'ja' ? 'データ駆動型マーケティングの新しいスタンダード' : locale === 'en' ? 'The new standard for data-driven marketing' : '數據驅動行銷的全新標準'}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyFeatures.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 2: How - 報價架構 */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {locale === 'ja' ? 'シンプルな価格設定' : locale === 'en' ? 'Simple Pricing Structure' : '簡單透明的價格結構'}
            </h2>
            <p className="text-gray-600 text-lg">
              {locale === 'ja' ? 'あなたのニーズに合わせて選べる2つのプラン' : locale === 'en' ? 'Choose from two plans that fit your needs' : '選擇最適合您需求的方案'}
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-lg p-1 shadow-sm border">
              <button
                onClick={() => setBillingType('monthly')}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  billingType === 'monthly' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {locale === 'ja' ? '月額プラン' : locale === 'en' ? 'Monthly Plan' : '月訂閱'}
              </button>
              <button
                onClick={() => setBillingType('lifetime')}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  billingType === 'lifetime' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {locale === 'ja' ? 'ライフタイム' : locale === 'en' ? 'Lifetime' : '終身訂閱'}
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Monthly Plan */}
            <Card className={`relative overflow-hidden ${billingType === 'monthly' ? 'ring-2 ring-blue-600 shadow-xl' : ''}`}>
              {billingType === 'monthly' && (
                <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-center py-2">
                  <span className="text-sm font-medium">
                    {locale === 'ja' ? '人気プラン' : locale === 'en' ? 'Popular Plan' : '熱門方案'}
                  </span>
                </div>
              )}
              <CardHeader className={`text-center ${billingType === 'monthly' ? 'pt-16' : 'pt-6'}`}>
                <div className="flex justify-center mb-4">
                  <Star className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">
                  {locale === 'ja' ? '月額プラン' : locale === 'en' ? 'Monthly Plan' : '月訂閱方案'}
                </CardTitle>
                <div className="mt-4">
                  <CurrencyConverter 
                    jpyAmount={pricingData.monthly.jpyPrice}
                    locale={locale}
                    className="text-center"
                  />
                  <p className="text-sm text-gray-600 mt-2 text-center">{t.pricing.perMonth}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Gift className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">
                      {pricingData.monthly.credits} {locale === 'ja' ? 'クレジット/月' : locale === 'en' ? 'credits/month' : '點數/月'}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {monthlyFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={`${locale === 'zh-TW' ? '' : `/${locale === 'en' ? 'en' : 'jp'}`}/subscription-checkout?plan=monthly&priceId=${pricingData.monthly.priceId}`}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                    {locale === 'ja' ? '月額サブスクリプション' : locale === 'en' ? 'Subscribe Monthly' : '月訂閱制'}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Lifetime Plan */}
            <Card className={`relative overflow-hidden ${billingType === 'lifetime' ? 'ring-2 ring-purple-600 shadow-xl' : ''}`}>
              {billingType === 'lifetime' && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-2">
                  <span className="text-sm font-medium flex items-center justify-center gap-1">
                    <Crown className="w-4 h-4" />
                    {locale === 'ja' ? '最もお得' : locale === 'en' ? 'Best Value' : '最超值'}
                  </span>
                </div>
              )}
              <CardHeader className={`text-center ${billingType === 'lifetime' ? 'pt-16' : 'pt-6'}`}>
                <div className="flex justify-center mb-4">
                  <Crown className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-2xl">
                  {locale === 'ja' ? 'ライフタイム' : locale === 'en' ? 'Lifetime Plan' : '終身訂閱'}
                </CardTitle>
                <div className="mt-4">
                  <CurrencyConverter 
                    jpyAmount={pricingData.lifetime.jpyPrice}
                    locale={locale}
                    className="text-center"
                  />
                  <p className="text-sm text-gray-600 mt-2 text-center">{t.pricing.oneTime}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-purple-600">
                      {pricingData.lifetime.credits} {locale === 'ja' ? 'クレジット/月' : locale === 'en' ? 'credits/month' : '點數/月'}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {lifetimeFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={`${locale === 'zh-TW' ? '' : `/${locale === 'en' ? 'en' : 'jp'}`}/subscription-checkout?plan=lifetime&priceId=${pricingData.lifetime.priceId}`}>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white" size="lg">
                    {locale === 'ja' ? '今すぐ購入' : locale === 'en' ? 'Buy Now' : '立即購買'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 3: What - 月訂閱跟終身內容差異 */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {locale === 'ja' ? 'プラン比較' : locale === 'en' ? 'Plan Comparison' : '方案比較'}
            </h2>
            <p className="text-gray-600 text-lg">
              {locale === 'ja' ? '各プランの詳細な機能比較' : locale === 'en' ? 'Detailed feature comparison for each plan' : '各方案詳細功能比較'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">
                      {locale === 'ja' ? '機能' : locale === 'en' ? 'Features' : '功能'}
                    </th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-900">
                      {locale === 'ja' ? '月額プラン' : locale === 'en' ? 'Monthly' : '月訂閱'}
                    </th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-900">
                      {locale === 'ja' ? 'ライフタイム' : locale === 'en' ? 'Lifetime' : '終身訂閱'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 font-medium">
                      {locale === 'ja' ? '月間クレジット' : locale === 'en' ? 'Monthly Credits' : '每月點數'}
                    </td>
                    <td className="px-6 py-4 text-center">350</td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-purple-600">700</span>
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-medium">
                      {locale === 'ja' ? '新機能優先アクセス' : locale === 'en' ? 'Priority Access to New Features' : '新功能優先使用'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-gray-400">-</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">
                      {locale === 'ja' ? 'クレジット使用割引' : locale === 'en' ? 'Credit Usage Discount' : '點數使用折扣'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-gray-400">-</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-purple-600">
                        {locale === 'ja' ? '特別割引' : locale === 'en' ? 'Special Discount' : '特別折扣'}
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-medium">
                      {locale === 'ja' ? '専用サポート' : locale === 'en' ? 'Dedicated Support' : '專屬客服'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-gray-600">
                        {locale === 'ja' ? '基本サポート' : locale === 'en' ? 'Basic Support' : '基本客服'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">
            {locale === 'ja' ? '今すぐ始めましょう' : locale === 'en' ? 'Get Started Today' : '立即開始使用'}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {locale === 'ja' ? '限定セール中、この機会をお見逃しなく' : locale === 'en' ? 'Limited time sale - don\'t miss this opportunity' : '限時特價中，機會難得'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              {locale === 'ja' ? '月額プランを試す' : locale === 'en' ? 'Try Monthly Plan' : '試用月訂閱'}
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              {locale === 'ja' ? 'ライフタイムを購入' : locale === 'en' ? 'Buy Lifetime' : '購買終身版'}
            </Button>
          </div>
        </section>
      </div>

      <Footer locale={locale} />
    </div>
  );
}