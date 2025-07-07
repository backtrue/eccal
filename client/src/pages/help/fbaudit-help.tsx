import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, CheckCircle, AlertCircle, TrendingUp, Users, Target, DollarSign } from "lucide-react";
import { Link } from "wouter";
import Footer from "@/components/Footer";

interface FbAuditHelpProps {
  locale: string;
}

const translations = {
  "zh-TW": {
    title: "FB廣告健檢 - 功能說明",
    subtitle: "AI 驅動的 Facebook 廣告效果診斷系統，幫助您優化廣告投放策略",
    whatIs: "什麼是 FB廣告健檢？",
    whatIsDesc: "FB廣告健檢是一個專業的 Facebook 廣告診斷工具，透過連接您的 Facebook 廣告帳戶，深度分析廣告效果並提供 AI 優化建議。",
    howItWorks: "如何使用？",
    features: "核心功能",
    benefits: "使用優勢",
    getStarted: "開始使用",
    getStartedDesc: "立即體驗專業的 Facebook 廣告診斷服務",
    startNow: "立即開始健檢",
    steps: {
      step1: "連接 Facebook 廣告帳戶",
      step1Desc: "安全授權您的 Facebook 廣告帳戶",
      step2: "選擇要分析的廣告帳戶",
      step2Desc: "從您的廣告帳戶中選擇要診斷的帳戶",
      step3: "獲得 AI 分析報告",
      step3Desc: "獲得詳細的廣告效果分析和優化建議"
    },
    featureList: {
      performance: "廣告效果分析",
      performanceDesc: "深度分析 ROAS、CTR、轉換率等關鍵指標",
      heroPost: "Hero Post 識別",
      heroPostDesc: "自動識別高效廣告素材，提供加碼投放建議",
      aiRecommend: "AI 優化建議",
      aiRecommendDesc: "基於數據分析提供個性化的優化策略",
      healthScore: "健康度評分",
      healthScoreDesc: "綜合評估廣告帳戶健康狀況並給出評分"
    },
    benefitList: {
      dataDriver: "數據驅動決策",
      dataDriverDesc: "基於真實廣告數據進行科學分析",
      timeEfficient: "節省時間成本",
      timeEfficientDesc: "自動化分析替代手工數據整理",
      aiPowered: "AI 智能建議",
      aiPoweredDesc: "專業 AI 分析師提供優化策略",
      actionable: "可執行建議",
      actionableDesc: "提供具體可行的優化操作建議"
    }
  },
  "en": {
    title: "Facebook Ads Health Check - Feature Guide",
    subtitle: "AI-powered Facebook advertising performance diagnostic system to optimize your ad campaigns",
    whatIs: "What is Facebook Ads Health Check?",
    whatIsDesc: "Facebook Ads Health Check is a professional Facebook advertising diagnostic tool that connects to your Facebook ad accounts, analyzes ad performance in depth, and provides AI optimization recommendations.",
    howItWorks: "How It Works",
    features: "Core Features",
    benefits: "Key Benefits",
    getStarted: "Get Started",
    getStartedDesc: "Experience professional Facebook advertising diagnostic services now",
    startNow: "Start Health Check",
    steps: {
      step1: "Connect Facebook Ad Account",
      step1Desc: "Securely authorize your Facebook advertising account",
      step2: "Select Ad Account to Analyze",
      step2Desc: "Choose the ad account you want to diagnose",
      step3: "Get AI Analysis Report",
      step3Desc: "Receive detailed ad performance analysis and optimization recommendations"
    },
    featureList: {
      performance: "Ad Performance Analysis",
      performanceDesc: "Deep analysis of key metrics like ROAS, CTR, conversion rates",
      heroPost: "Hero Post Identification",
      heroPostDesc: "Automatically identify high-performing ad creatives with scaling recommendations",
      aiRecommend: "AI Optimization Recommendations",
      aiRecommendDesc: "Personalized optimization strategies based on data analysis",
      healthScore: "Health Score Rating",
      healthScoreDesc: "Comprehensive assessment of ad account health with scoring"
    },
    benefitList: {
      dataDriver: "Data-Driven Decisions",
      dataDriverDesc: "Scientific analysis based on real advertising data",
      timeEfficient: "Time Cost Savings",
      timeEfficientDesc: "Automated analysis replaces manual data organization",
      aiPowered: "AI-Powered Insights",
      aiPoweredDesc: "Professional AI analyst provides optimization strategies",
      actionable: "Actionable Recommendations",
      actionableDesc: "Specific and executable optimization suggestions"
    }
  },
  "ja": {
    title: "Facebook広告ヘルスチェック - 機能説明",
    subtitle: "AI駆動のFacebook広告効果診断システムで、広告キャンペーンを最適化",
    whatIs: "Facebook広告ヘルスチェックとは？",
    whatIsDesc: "Facebook広告ヘルスチェックは、プロフェッショナルなFacebook広告診断ツールです。Facebook広告アカウントに接続し、広告効果を深く分析してAI最適化提案を提供します。",
    howItWorks: "使用方法",
    features: "コア機能",
    benefits: "利用メリット",
    getStarted: "はじめに",
    getStartedDesc: "プロフェッショナルなFacebook広告診断サービスを今すぐ体験",
    startNow: "ヘルスチェック開始",
    steps: {
      step1: "Facebook広告アカウント接続",
      step1Desc: "Facebook広告アカウントを安全に認証",
      step2: "分析する広告アカウントを選択",
      step2Desc: "診断したい広告アカウントを選択",
      step3: "AI分析レポートを取得",
      step3Desc: "詳細な広告効果分析と最適化提案を受け取る"
    },
    featureList: {
      performance: "広告効果分析",
      performanceDesc: "ROAS、CTR、コンバージョン率などの重要指標を深く分析",
      heroPost: "Hero Post識別",
      heroPostDesc: "高効果な広告クリエイティブを自動識別し、拡張投資提案を提供",
      aiRecommend: "AI最適化提案",
      aiRecommendDesc: "データ分析に基づくパーソナライズされた最適化戦略",
      healthScore: "ヘルススコア評価",
      healthScoreDesc: "広告アカウントの健康状態を総合評価してスコア化"
    },
    benefitList: {
      dataDriver: "データ駆動意思決定",
      dataDriverDesc: "実際の広告データに基づく科学的分析",
      timeEfficient: "時間コスト削減",
      timeEfficientDesc: "自動化分析が手作業でのデータ整理を代替",
      aiPowered: "AI智能インサイト",
      aiPoweredDesc: "専門AI分析師が最適化戦略を提供",
      actionable: "実行可能な提案",
      actionableDesc: "具体的で実行可能な最適化操作提案"
    }
  }
};

export default function FbAuditHelp({ locale }: FbAuditHelpProps) {
  const t = translations[locale as keyof typeof translations] || translations["zh-TW"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* What is FB Audit */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              {t.whatIs}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {t.whatIsDesc}
            </p>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              {t.howItWorks}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2">{t.steps.step1}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t.steps.step1Desc}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold mb-2">{t.steps.step2}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t.steps.step2Desc}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2">{t.steps.step3}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t.steps.step3Desc}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Core Features */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-500" />
              {t.features}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  {t.featureList.performance}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t.featureList.performanceDesc}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" />
                  {t.featureList.heroPost}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t.featureList.heroPostDesc}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  {t.featureList.aiRecommend}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t.featureList.aiRecommendDesc}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-orange-500" />
                  {t.featureList.healthScore}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t.featureList.healthScoreDesc}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-500" />
              {t.benefits}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">{t.benefitList.dataDriver}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t.benefitList.dataDriverDesc}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">{t.benefitList.timeEfficient}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t.benefitList.timeEfficientDesc}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">{t.benefitList.aiPowered}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t.benefitList.aiPoweredDesc}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">{t.benefitList.actionable}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t.benefitList.actionableDesc}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Get Started */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">{t.getStarted}</CardTitle>
            <CardDescription className="text-center">
              {t.getStartedDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/fbaudit">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                {t.startNow}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}