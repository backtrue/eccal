import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, Target, BarChart3, Activity, ArrowRight, Zap, Shield } from "lucide-react";
import { Link } from "wouter";
import NavigationBar from "@/components/NavigationBar";
import Footer from "@/components/Footer";
import { getTranslations, type Locale } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics";
import { trackMetaEvent } from "@/lib/meta-pixel";

interface HomeProps {
  locale: Locale;
}

export default function Home({ locale }: HomeProps) {
  const t = getTranslations(locale);

  const handleCalculatorClick = () => {
    trackEvent('navigate_calculator', 'navigation', 'home_page');
    trackMetaEvent('ViewContent', { content_name: 'Calculator Page', content_category: 'Navigation' });
  };

  const handleCampaignPlannerClick = () => {
    trackEvent('navigate_campaign_planner', 'navigation', 'home_page');
    trackMetaEvent('ViewContent', { content_name: 'Campaign Planner Page', content_category: 'Navigation' });
  };

  const handleFbAuditClick = () => {
    trackEvent('navigate_fbaudit', 'navigation', 'home_page');
    trackMetaEvent('ViewContent', { content_name: 'FB Audit Page', content_category: 'Navigation' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <NavigationBar locale={locale} />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            {locale === 'zh-TW' ? '報數據' : locale === 'en' ? 'Report Data' : 'レポートデータ'}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4">
            {locale === 'zh-TW' 
              ? '專業電商廣告分析平台'
              : locale === 'en'
              ? 'Professional E-commerce Advertising Analytics Platform'
              : 'プロフェッショナル電子商取引広告分析プラットフォーム'}
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
            {locale === 'zh-TW' 
              ? '提供 Facebook 廣告健檢、預算計算、活動規劃三大核心服務，助您精準投放廣告，最大化投資回報'
              : locale === 'en'
              ? 'Offering three core services: Facebook ad health checks, budget calculation, and campaign planning to optimize your advertising ROI'
              : 'Facebook広告ヘルスチェック、予算計算、キャンペーン企画の3つのコアサービスで、広告ROIを最大化'}
          </p>

          {/* Service Cards Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* FB Ads Health Check */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-red-200 dark:hover:border-red-800">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Activity className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-xl">
                  {locale === 'zh-TW' ? 'FB廣告健檢' : locale === 'en' ? 'FB Ads Health Check' : 'FB広告ヘルスチェック'}
                </CardTitle>
                <Badge variant="outline" className="w-fit mx-auto">
                  {locale === 'zh-TW' ? 'AI 驅動' : locale === 'en' ? 'AI Powered' : 'AI駆動'}
                </Badge>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  {locale === 'zh-TW' 
                    ? '專業 AI 分析您的 Facebook 廣告帳戶表現，提供個人化改善建議與 Hero Post 識別'
                    : locale === 'en'
                    ? 'Professional AI analysis of your Facebook ad account performance with personalized improvement suggestions and Hero Post identification'
                    : 'Facebook広告アカウントのパフォーマンスをプロのAIが分析し、個別の改善提案とHero Post識別を提供'}
                </p>
                <Link href={locale === 'zh-TW' ? '/fbaudit' : `/${locale === 'en' ? 'en' : 'jp'}/fbaudit`}>
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
                    onClick={handleFbAuditClick}
                  >
                    {locale === 'zh-TW' ? '開始健檢' : locale === 'en' ? 'Start Health Check' : 'ヘルスチェック開始'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Budget Calculator */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 dark:hover:border-blue-800">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calculator className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl">
                  {locale === 'zh-TW' ? '廣告預算計算機' : locale === 'en' ? 'Ad Budget Calculator' : '広告予算計算機'}
                </CardTitle>
                <Badge variant="outline" className="w-fit mx-auto">
                  {locale === 'zh-TW' ? 'GA4 整合' : locale === 'en' ? 'GA4 Integration' : 'GA4連携'}
                </Badge>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  {locale === 'zh-TW' 
                    ? '根據目標營收、客單價、轉換率智能計算廣告預算需求，支援 Google Analytics 數據匯入'
                    : locale === 'en'
                    ? 'Intelligent ad budget calculation based on target revenue, AOV, and conversion rate with Google Analytics data import'
                    : '目標売上、客単価、コンバージョン率に基づく知的広告予算計算、Google Analyticsデータインポート対応'}
                </p>
                <Link href={locale === 'zh-TW' ? '/calculator' : `/${locale === 'en' ? 'en' : 'jp'}/calculator`}>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
                    onClick={handleCalculatorClick}
                  >
                    {locale === 'zh-TW' ? '開始計算' : locale === 'en' ? 'Start Calculating' : '計算開始'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Campaign Planner */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-200 dark:hover:border-purple-800">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl">
                  {locale === 'zh-TW' ? '活動預算規劃師' : locale === 'en' ? 'Campaign Budget Planner' : 'キャンペーン予算プランナー'}
                </CardTitle>
                <Badge variant="outline" className="w-fit mx-auto">
                  {locale === 'zh-TW' ? 'PRO 功能' : locale === 'en' ? 'PRO Feature' : 'PRO機能'}
                </Badge>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  {locale === 'zh-TW' 
                    ? '專業五階段活動預算配置：預熱期、啟動期、主推期、衝刺期、回購期，智能分配每日預算'
                    : locale === 'en'
                    ? 'Professional 5-phase campaign budget allocation: Pre-heat, Launch, Main, Final, Repurchase with intelligent daily budget distribution'
                    : 'プロ5段階キャンペーン予算配分：予熱期、開始期、メイン期、最終期、リピート期、知的日次予算分散'}
                </p>
                <Link href={locale === 'zh-TW' ? '/campaign-planner' : `/${locale === 'en' ? 'en' : 'jp'}/campaign-planner`}>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white"
                    onClick={handleCampaignPlannerClick}
                  >
                    {locale === 'zh-TW' ? '開始規劃' : locale === 'en' ? 'Start Planning' : '企画開始'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Quick Access Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={locale === 'zh-TW' ? '/pricing' : `/${locale === 'en' ? 'en' : 'jp'}/pricing`}>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                <Zap className="mr-2 h-5 w-5" />
                {locale === 'zh-TW' ? '查看方案' : locale === 'en' ? 'View Pricing' : '料金プラン'}
              </Button>
            </Link>
            <Link href={locale === 'zh-TW' ? '/help/fbaudit' : `/${locale === 'en' ? 'en' : 'jp'}/help/fbaudit`}>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                <Shield className="mr-2 h-5 w-5" />
                {locale === 'zh-TW' ? '功能說明' : locale === 'en' ? 'Feature Guide' : '機能説明'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {locale === 'zh-TW' ? '為什麼選擇報數據？' : locale === 'en' ? 'Why Choose Report Data?' : 'なぜレポートデータを選ぶのか？'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {locale === 'zh-TW' 
                ? '專業的電商廣告分析平台，整合 AI 智能分析、數據驅動決策、多語言支援'
                : locale === 'en'
                ? 'Professional e-commerce advertising analytics platform with AI-powered analysis, data-driven decisions, and multilingual support'
                : 'AI知的分析、データ駆動決定、多言語サポートを統合したプロフェッショナル電子商取引広告分析プラットフォーム'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Zap className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {locale === 'zh-TW' ? 'AI 智能分析' : locale === 'en' ? 'AI-Powered Analysis' : 'AI知的分析'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {locale === 'zh-TW' 
                  ? '運用最新 AI 技術深度分析廣告數據，提供專業改善建議'
                  : locale === 'en'
                  ? 'Leverage cutting-edge AI technology to deeply analyze ad data and provide professional improvement suggestions'
                  : '最新のAI技術を活用して広告データを深く分析し、プロの改善提案を提供'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {locale === 'zh-TW' ? '精準預算規劃' : locale === 'en' ? 'Precise Budget Planning' : '精密予算計画'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {locale === 'zh-TW' 
                  ? '科學化的預算計算與分配策略，最大化廣告投資回報率'
                  : locale === 'en'
                  ? 'Scientific budget calculation and allocation strategies to maximize advertising ROI'
                  : '科学的な予算計算と配分戦略で、広告ROIを最大化'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {locale === 'zh-TW' ? '多語言專業支援' : locale === 'en' ? 'Multilingual Professional Support' : '多言語プロサポート'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {locale === 'zh-TW' 
                  ? '支援繁體中文、英文、日文，專業商務術語本地化'
                  : locale === 'en'
                  ? 'Support for Traditional Chinese, English, and Japanese with localized professional business terminology'
                  : '繁体字中国語、英語、日本語対応、プロビジネス用語のローカライズ'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}