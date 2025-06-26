import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, TrendingUp, Target, BarChart3 } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavigationBar locale={locale} />
      
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {t.metaTitle}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t.metaDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={locale === 'zh-TW' ? '/calculator' : `/${locale === 'en' ? 'en' : 'jp'}/calculator`}>
              <Button 
                size="lg" 
                className="text-lg px-8 py-3"
                onClick={handleCalculatorClick}
              >
                <Calculator className="mr-2 h-5 w-5" />
                {t.calculator}
              </Button>
            </Link>
            <Link href={locale === 'zh-TW' ? '/campaign-planner' : `/${locale === 'en' ? 'en' : 'jp'}/campaign-planner`}>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-3"
                onClick={handleCampaignPlannerClick}
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                {t.campaignPlanner}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {locale === 'zh-TW' ? '專業功能' : locale === 'en' ? 'Professional Features' : 'プロ機能'}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {locale === 'zh-TW' 
                ? '提供完整的電商廣告預算規劃工具，幫助您精準計算投資回報'
                : locale === 'en'
                ? 'Complete e-commerce advertising budget planning tools to help you calculate ROI accurately'
                : 'Eコマース広告予算計画ツールでROIを正確に計算'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calculator className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>{t.calculator}</CardTitle>
                <CardDescription>
                  {locale === 'zh-TW' 
                    ? '快速計算廣告預算需求'
                    : locale === 'en'
                    ? 'Quick ad budget calculation'
                    : '広告予算の迅速計算'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {locale === 'zh-TW' 
                    ? '根據目標營收、客單價和轉換率，精準計算所需廣告預算'
                    : locale === 'en'
                    ? 'Calculate required ad budget based on target revenue, AOV, and conversion rate'
                    : '目標売上、客単価、コンバージョン率に基づいた広告予算計算'}
                </p>
                <Link href={locale === 'zh-TW' ? '/calculator' : `/${locale === 'en' ? 'en' : 'jp'}/calculator`}>
                  <Button variant="outline" onClick={handleCalculatorClick}>
                    {locale === 'zh-TW' ? '開始計算' : locale === 'en' ? 'Start Calculating' : '計算開始'}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>{t.campaignPlanner}</CardTitle>
                <CardDescription>
                  {locale === 'zh-TW' 
                    ? '專業活動預算規劃'
                    : locale === 'en'
                    ? 'Professional campaign planning'
                    : 'プロ向けキャンペーン企画'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {locale === 'zh-TW' 
                    ? '8步驟完整活動規劃，包含預熱、啟動、主推、收尾各階段預算配置'
                    : locale === 'en'
                    ? '8-step complete campaign planning with budget allocation for all phases'
                    : '8ステップ完全キャンペーン企画、全フェーズの予算配分'}
                </p>
                <Link href={locale === 'zh-TW' ? '/campaign-planner' : `/${locale === 'en' ? 'en' : 'jp'}/campaign-planner`}>
                  <Button variant="outline" onClick={handleCampaignPlannerClick}>
                    {locale === 'zh-TW' ? '開始規劃' : locale === 'en' ? 'Start Planning' : '企画開始'}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>
                  {locale === 'zh-TW' ? 'GA4 整合' : locale === 'en' ? 'GA4 Integration' : 'GA4連携'}
                </CardTitle>
                <CardDescription>
                  {locale === 'zh-TW' 
                    ? '自動匯入歷史數據'
                    : locale === 'en'
                    ? 'Automatic historical data import'
                    : '履歴データ自動インポート'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {locale === 'zh-TW' 
                    ? '連接 Google Analytics 4，自動匯入平均客單價和轉換率數據'
                    : locale === 'en'
                    ? 'Connect Google Analytics 4 to auto-import AOV and conversion rate data'
                    : 'Google Analytics 4に接続し、AOVとコンバージョン率を自動インポート'}
                </p>
                <Button variant="outline" disabled>
                  {locale === 'zh-TW' ? '計算器內啟用' : locale === 'en' ? 'Enable in Calculator' : '計算機で有効化'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}