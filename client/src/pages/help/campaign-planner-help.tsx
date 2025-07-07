import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, CheckCircle, AlertCircle, Calendar, TrendingUp, Users, Target, DollarSign, Clock, Zap } from "lucide-react";
import { Link } from "wouter";
import Footer from "@/components/Footer";

interface CampaignPlannerHelpProps {
  locale: string;
}

const translations = {
  "zh-TW": {
    title: "活動預算規劃師 - 功能說明",
    subtitle: "專業的活動預算分配工具，智能規劃不同活動階段的預算配置，最大化廣告效果",
    whatIs: "什麼是活動預算規劃師？",
    whatIsDesc: "活動預算規劃師是一個進階的廣告活動規劃工具，能夠將您的總預算智能分配到預熱期、啟動期、主推期、衝刺期和回購期五個階段，確保每個階段都有最佳的預算配置和流量分配。",
    howItWorks: "如何使用？",
    features: "核心功能",
    benefits: "使用優勢",
    getStarted: "開始使用",
    getStartedDesc: "立即體驗專業的活動預算規劃服務",
    startNow: "立即開始規劃",
    proFeature: "PRO 功能",
    steps: {
      step1: "設定活動參數",
      step1Desc: "輸入活動期間、目標營收、客單價等基本資訊",
      step2: "選擇預算策略",
      step2Desc: "系統根據活動長度智能推薦最佳預算分配策略",
      step3: "獲得詳細規劃",
      step3Desc: "取得完整的分期預算表和每日執行計畫"
    },
    featureList: {
      smartAllocation: "智能預算分配",
      smartAllocationDesc: "根據活動長度自動調整五階段預算比例配置",
      periodPlanning: "分期活動規劃",
      periodPlanningDesc: "預熱期4%、啟動期32%、主推期38%、衝刺期24%、回購期2%",
      dailyBreakdown: "每日執行計畫",
      dailyBreakdownDesc: "詳細的每日預算和流量分配建議",
      dynamicOptimization: "動態最佳化",
      dynamicOptimizationDesc: "根據活動天數動態調整預算分配策略"
    },
    benefitList: {
      maxROI: "最大化投資回報",
      maxROIDesc: "科學的預算分配確保每個階段都能發揮最大效益",
      riskManagement: "風險控制管理",
      riskManagementDesc: "避免預算集中投放，降低活動失敗風險",
      systematicApproach: "系統化規劃",
      systematicApproachDesc: "完整的活動生命週期管理和執行指引",
      timeOptimization: "時間效率最佳化",
      timeOptimizationDesc: "自動化規劃節省大量人工計算時間"
    },
    periods: {
      preheat: "預熱期",
      launch: "啟動期", 
      main: "主推期",
      final: "衝刺期",
      repurchase: "回購期"
    }
  },
  "en": {
    title: "Campaign Budget Planner - Feature Guide",
    subtitle: "Professional campaign budget allocation tool that intelligently plans budget distribution across different campaign phases to maximize advertising effectiveness",
    whatIs: "What is the Campaign Budget Planner?",
    whatIsDesc: "The Campaign Budget Planner is an advanced advertising campaign planning tool that intelligently allocates your total budget across five phases: Pre-heat, Launch, Main, Final, and Repurchase periods, ensuring optimal budget allocation and traffic distribution for each phase.",
    howItWorks: "How It Works",
    features: "Core Features",
    benefits: "Key Benefits",
    getStarted: "Get Started",
    getStartedDesc: "Experience professional campaign budget planning services now",
    startNow: "Start Planning",
    proFeature: "PRO Feature",
    steps: {
      step1: "Set Campaign Parameters",
      step1Desc: "Input campaign duration, target revenue, average order value and other basic information",
      step2: "Choose Budget Strategy",
      step2Desc: "System intelligently recommends optimal budget allocation strategy based on campaign length",
      step3: "Get Detailed Plan",
      step3Desc: "Receive complete phased budget table and daily execution plan"
    },
    featureList: {
      smartAllocation: "Smart Budget Allocation",
      smartAllocationDesc: "Automatically adjust five-phase budget ratio configuration based on campaign length",
      periodPlanning: "Phased Campaign Planning",
      periodPlanningDesc: "Pre-heat 4%, Launch 32%, Main 38%, Final 24%, Repurchase 2%",
      dailyBreakdown: "Daily Execution Plan",
      dailyBreakdownDesc: "Detailed daily budget and traffic allocation recommendations",
      dynamicOptimization: "Dynamic Optimization",
      dynamicOptimizationDesc: "Dynamically adjust budget allocation strategy based on campaign duration"
    },
    benefitList: {
      maxROI: "Maximize Return on Investment",
      maxROIDesc: "Scientific budget allocation ensures maximum effectiveness in each phase",
      riskManagement: "Risk Control Management",
      riskManagementDesc: "Avoid concentrated budget spending, reduce campaign failure risks",
      systematicApproach: "Systematic Planning",
      systematicApproachDesc: "Complete campaign lifecycle management and execution guidance",
      timeOptimization: "Time Efficiency Optimization",
      timeOptimizationDesc: "Automated planning saves significant manual calculation time"
    },
    periods: {
      preheat: "Pre-heat",
      launch: "Launch",
      main: "Main",
      final: "Final",
      repurchase: "Repurchase"
    }
  },
  "ja": {
    title: "キャンペーン予算プランナー - 機能説明",
    subtitle: "プロフェッショナルなキャンペーン予算配分ツールで、異なるキャンペーン段階の予算配置を知的に計画し、広告効果を最大化",
    whatIs: "キャンペーン予算プランナーとは？",
    whatIsDesc: "キャンペーン予算プランナーは、高度な広告キャンペーン計画ツールです。総予算を予熱期、開始期、メイン期、最終期、リピート期の5つの段階に知的に配分し、各段階で最適な予算配置とトラフィック分散を確保します。",
    howItWorks: "使用方法",
    features: "コア機能",
    benefits: "利用メリット",
    getStarted: "はじめに",
    getStartedDesc: "プロフェッショナルなキャンペーン予算計画サービスを今すぐ体験",
    startNow: "計画開始",
    proFeature: "PRO機能",
    steps: {
      step1: "キャンペーンパラメータ設定",
      step1Desc: "キャンペーン期間、目標売上、平均注文額などの基本情報を入力",
      step2: "予算戦略選択",
      step2Desc: "システムがキャンペーン長に基づいて最適な予算配分戦略を知的に推薦",
      step3: "詳細計画取得",
      step3Desc: "完全な段階別予算表と日次実行計画を取得"
    },
    featureList: {
      smartAllocation: "スマート予算配分",
      smartAllocationDesc: "キャンペーン長に基づいて5段階予算比率構成を自動調整",
      periodPlanning: "段階別キャンペーン計画",
      periodPlanningDesc: "予熱期4%、開始期32%、メイン期38%、最終期24%、リピート期2%",
      dailyBreakdown: "日次実行計画",
      dailyBreakdownDesc: "詳細な日次予算とトラフィック配分推奨",
      dynamicOptimization: "動的最適化",
      dynamicOptimizationDesc: "キャンペーン期間に基づいて予算配分戦略を動的に調整"
    },
    benefitList: {
      maxROI: "投資収益率最大化",
      maxROIDesc: "科学的な予算配分が各段階で最大効果を確保",
      riskManagement: "リスク制御管理",
      riskManagementDesc: "予算集中投入を避け、キャンペーン失敗リスクを軽減",
      systematicApproach: "システマティック計画",
      systematicApproachDesc: "完全なキャンペーンライフサイクル管理と実行ガイダンス",
      timeOptimization: "時間効率最適化",
      timeOptimizationDesc: "自動化計画が大幅な手作業計算時間を節約"
    },
    periods: {
      preheat: "予熱期",
      launch: "開始期",
      main: "メイン期", 
      final: "最終期",
      repurchase: "リピート期"
    }
  }
};

export default function CampaignPlannerHelp({ locale }: CampaignPlannerHelpProps) {
  const t = translations[locale as keyof typeof translations] || translations["zh-TW"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {t.title}
            </h1>
            <Badge variant="outline" className="text-purple-600 border-purple-600">
              {t.proFeature}
            </Badge>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* What is Campaign Planner */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
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
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2">{t.steps.step1}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t.steps.step1Desc}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2">{t.steps.step2}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t.steps.step2Desc}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
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
              <CheckCircle className="h-5 w-5 text-green-500" />
              {t.features}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-500" />
                  {t.featureList.smartAllocation}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t.featureList.smartAllocationDesc}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  {t.featureList.periodPlanning}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t.featureList.periodPlanningDesc}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  {t.featureList.dailyBreakdown}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t.featureList.dailyBreakdownDesc}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  {t.featureList.dynamicOptimization}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t.featureList.dynamicOptimizationDesc}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Periods Visualization */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">五階段預算分配模型</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2 mb-4">
              <div className="text-center p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <div className="text-xs font-medium text-blue-700 dark:text-blue-300">{t.periods.preheat}</div>
                <div className="text-lg font-bold text-blue-800 dark:text-blue-200">4%</div>
              </div>
              <div className="text-center p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <div className="text-xs font-medium text-green-700 dark:text-green-300">{t.periods.launch}</div>
                <div className="text-lg font-bold text-green-800 dark:text-green-200">32%</div>
              </div>
              <div className="text-center p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <div className="text-xs font-medium text-purple-700 dark:text-purple-300">{t.periods.main}</div>
                <div className="text-lg font-bold text-purple-800 dark:text-purple-200">38%</div>
              </div>
              <div className="text-center p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <div className="text-xs font-medium text-orange-700 dark:text-orange-300">{t.periods.final}</div>
                <div className="text-lg font-bold text-orange-800 dark:text-orange-200">24%</div>
              </div>
              <div className="text-center p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <div className="text-xs font-medium text-red-700 dark:text-red-300">{t.periods.repurchase}</div>
                <div className="text-lg font-bold text-red-800 dark:text-red-200">2%</div>
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
                  <h3 className="font-semibold">{t.benefitList.maxROI}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t.benefitList.maxROIDesc}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">{t.benefitList.riskManagement}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t.benefitList.riskManagementDesc}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">{t.benefitList.systematicApproach}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t.benefitList.systematicApproachDesc}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">{t.benefitList.timeOptimization}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t.benefitList.timeOptimizationDesc}
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
            <Link href="/campaign-planner">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
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