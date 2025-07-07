import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, CheckCircle, AlertCircle, Calculator, TrendingUp, Users, Target, DollarSign, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import Footer from "@/components/Footer";

interface CalculatorHelpProps {
  locale: string;
}

const translations = {
  "zh-TW": {
    title: "廣告預算計算機 - 功能說明",
    subtitle: "智能廣告預算計算工具，幫助您精準計算 Facebook、Instagram 廣告投資需求",
    whatIs: "什麼是廣告預算計算機？",
    whatIsDesc: "廣告預算計算機是一個專業的廣告投資規劃工具，只需輸入目標營收、客單價、轉換率，即可自動計算出所需的廣告預算和流量需求，讓您告別瞎猜和試錯。",
    howItWorks: "如何使用？",
    features: "核心功能",
    benefits: "使用優勢",
    getStarted: "開始使用",
    getStartedDesc: "立即體驗智能廣告預算計算服務",
    startNow: "立即開始計算",
    steps: {
      step1: "輸入目標數據",
      step1Desc: "填入目標營收、平均客單價、預期轉換率",
      step2: "選擇數據來源",
      step2Desc: "可選擇手動輸入或連接 Google Analytics 自動填入",
      step3: "獲得精準結果",
      step3Desc: "獲得詳細的預算分配和流量需求分析"
    },
    featureList: {
      budgetCalc: "智能預算計算",
      budgetCalcDesc: "根據目標營收自動計算所需廣告預算",
      trafficAnalysis: "流量需求分析",
      trafficAnalysisDesc: "計算達成目標所需的網站流量和廣告點擊",
      gaIntegration: "GA 數據整合",
      gaIntegrationDesc: "連接 Google Analytics 自動填入歷史數據",
      roasCalculation: "ROAS 目標計算",
      roasCalculationDesc: "自動計算投資報酬率和效益分析"
    },
    benefitList: {
      dataDriver: "科學化預算規劃",
      dataDriverDesc: "基於真實數據進行精準的預算計算",
      timeEfficient: "快速決策支援",
      timeEfficientDesc: "幾秒鐘內獲得完整的預算規劃方案",
      riskReduction: "降低投資風險",
      riskReductionDesc: "避免盲目投資，提高廣告投放成功率",
      goalOriented: "目標導向規劃",
      goalOrientedDesc: "以營收目標為核心的反推式計算方法"
    }
  },
  "en": {
    title: "Ad Budget Calculator - Feature Guide",
    subtitle: "Smart advertising budget calculation tool to help you accurately calculate Facebook and Instagram ad investment needs",
    whatIs: "What is the Ad Budget Calculator?",
    whatIsDesc: "The Ad Budget Calculator is a professional advertising investment planning tool. Simply input your target revenue, average order value, and conversion rate to automatically calculate the required ad budget and traffic needs. Say goodbye to guessing and trial-and-error.",
    howItWorks: "How It Works",
    features: "Core Features",
    benefits: "Key Benefits",
    getStarted: "Get Started",
    getStartedDesc: "Experience smart advertising budget calculation services now",
    startNow: "Start Calculating",
    steps: {
      step1: "Input Target Data",
      step1Desc: "Enter target revenue, average order value, expected conversion rate",
      step2: "Choose Data Source",
      step2Desc: "Manual input or connect Google Analytics for auto-fill",
      step3: "Get Precise Results",
      step3Desc: "Receive detailed budget allocation and traffic requirement analysis"
    },
    featureList: {
      budgetCalc: "Smart Budget Calculation",
      budgetCalcDesc: "Automatically calculate required ad budget based on target revenue",
      trafficAnalysis: "Traffic Requirement Analysis",
      trafficAnalysisDesc: "Calculate website traffic and ad clicks needed to achieve goals",
      gaIntegration: "GA Data Integration",
      gaIntegrationDesc: "Connect Google Analytics to auto-fill historical data",
      roasCalculation: "ROAS Target Calculation",
      roasCalculationDesc: "Automatically calculate return on ad spend and efficiency analysis"
    },
    benefitList: {
      dataDriver: "Scientific Budget Planning",
      dataDriverDesc: "Precise budget calculation based on real data",
      timeEfficient: "Fast Decision Support",
      timeEfficientDesc: "Get complete budget planning solutions in seconds",
      riskReduction: "Investment Risk Reduction",
      riskReductionDesc: "Avoid blind investment, improve ad campaign success rates",
      goalOriented: "Goal-Oriented Planning",
      goalOrientedDesc: "Revenue-target-centered reverse calculation method"
    }
  },
  "ja": {
    title: "広告予算計算機 - 機能説明",
    subtitle: "スマート広告予算計算ツールで、Facebook・Instagram広告投資ニーズを正確に計算",
    whatIs: "広告予算計算機とは？",
    whatIsDesc: "広告予算計算機は、プロフェッショナルな広告投資計画ツールです。目標売上、平均注文額、コンバージョン率を入力するだけで、必要な広告予算とトラフィック要件を自動計算。推測や試行錯誤とはもうお別れです。",
    howItWorks: "使用方法",
    features: "コア機能",
    benefits: "利用メリット",
    getStarted: "はじめに",
    getStartedDesc: "スマート広告予算計算サービスを今すぐ体験",
    startNow: "計算開始",
    steps: {
      step1: "目標データ入力",
      step1Desc: "目標売上、平均注文額、予想コンバージョン率を入力",
      step2: "データソース選択",
      step2Desc: "手動入力またはGoogle Analytics連携で自動入力",
      step3: "精密な結果取得",
      step3Desc: "詳細な予算配分とトラフィック要件分析を取得"
    },
    featureList: {
      budgetCalc: "スマート予算計算",
      budgetCalcDesc: "目標売上に基づいて必要な広告予算を自動計算",
      trafficAnalysis: "トラフィック要件分析",
      trafficAnalysisDesc: "目標達成に必要なウェブサイトトラフィックと広告クリックを計算",
      gaIntegration: "GA データ統合",
      gaIntegrationDesc: "Google Analytics連携で履歴データを自動入力",
      roasCalculation: "ROAS 目標計算",
      roasCalculationDesc: "広告費用対効果と効率分析を自動計算"
    },
    benefitList: {
      dataDriver: "科学的予算計画",
      dataDriverDesc: "実際のデータに基づく精密な予算計算",
      timeEfficient: "高速意思決定支援",
      timeEfficientDesc: "数秒で完全な予算計画ソリューションを取得",
      riskReduction: "投資リスク軽減",
      riskReductionDesc: "盲目的投資を避け、広告キャンペーン成功率を向上",
      goalOriented: "目標指向計画",
      goalOrientedDesc: "売上目標中心の逆算計算方法"
    }
  }
};

export default function CalculatorHelp({ locale }: CalculatorHelpProps) {
  const t = translations[locale as keyof typeof translations] || translations["zh-TW"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
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

        {/* What is Calculator */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-green-500" />
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
              <Target className="h-5 w-5 text-blue-500" />
              {t.howItWorks}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold mb-2">{t.steps.step1}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t.steps.step1Desc}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
                  <Calculator className="h-4 w-4 text-green-500" />
                  {t.featureList.budgetCalc}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t.featureList.budgetCalcDesc}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  {t.featureList.trafficAnalysis}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t.featureList.trafficAnalysisDesc}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-orange-500" />
                  {t.featureList.gaIntegration}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t.featureList.gaIntegrationDesc}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-purple-500" />
                  {t.featureList.roasCalculation}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t.featureList.roasCalculationDesc}
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
                  <h3 className="font-semibold">{t.benefitList.riskReduction}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t.benefitList.riskReductionDesc}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">{t.benefitList.goalOriented}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t.benefitList.goalOrientedDesc}
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
            <Link href="/calculator">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
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