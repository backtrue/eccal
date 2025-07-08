// Internationalization configuration and utilities
export type Locale = 'zh-TW' | 'en' | 'ja';

export interface TranslationData {
  // Navigation
  home: string;
  calculator: string;
  privacy: string;
  terms: string;
  
  // Authentication
  loginWithGoogle: string;
  logout: string;
  login: string;
  
  // Calculator
  calculatorTitle: string;
  calculatorDescription: string;
  monthlyRevenue: string;
  averageOrderValue: string;
  conversionRate: string;
  costPerClick: string;
  calculate: string;
  results: string;
  requiredOrders: string;
  requiredTraffic: string;
  monthlyAdBudget: string;
  dailyAdBudget: string;
  
  // Campaign Planner
  campaignPlanner: string;
  campaignPlannerDescription: string;
  
  // Common
  loading: string;
  error: string;
  submit: string;
  cancel: string;
  save: string;
  delete: string;
  edit: string;
  
  // Footer
  companyName: string;
  allRightsReserved: string;
  courseLink: string;
  blog: string;
  
  // Units
  currency: string;
  percentage: string;
  orders: string;
  visitors: string;
  cpcValue: number;
  
  // Pricing navigation label
  pricingLabel: string;
  
  // Pricing
  pricing: {
    monthlyPlan: string;
    lifetimePlan: string;
    monthlyPrice: string;
    lifetimePrice: string;
    perMonth: string;
    oneTime: string;
    currency: string;
    features: {
      allFeatures: string;
      prioritySupport: string;
      monthlyCredits: string;
      advancedAnalytics: string;
      lifetimeAccess: string;
      unlimitedCredits: string;
    };
  };
  
  // Meta
  metaTitle: string;
  metaDescription: string;
  
  // GA Integration
  gaIntegration: string;
  gaLogin: string;
  gaSelectProperty: string;
  gaAutoFill: string;
  
  // Brevo Integration
  emailSaved: string;
  emailSaveError: string;
  
  // Referral System
  referralDescription: string;
  shareText: string;
  
  // Membership System
  freeMember: string;
  proMember: string;
  upgradeToPro: string;
  membershipExpires: string;
  insufficientCredits: string;
  upgradeSuccess: string;
  upgradeError: string;
  
  // Calculator Page Additional
  connectAccountTitle: string;
  connectAccountDescription: string;
  googleAnalytics: string;
  facebookAds: string;
  connected: string;
  notConnected: string;
  targetRevenuePlaceholder: string;
  aovPlaceholder: string;
  conversionRatePlaceholder: string;
  targetMonthlyRevenue: string;
  targetMonthlyRevenueUnit: string;
  averageOrderValueUnit: string;
  conversionRateUnit: string;
  calculateBudget: string;
  calculationResults: string;
  monthlyRequiredOrders: string;
  ordersUnit: string;
  dailyApprox: string;
  monthlyRequiredTraffic: string;
  visitorsUnit: string;
  suggestedDailyBudget: string;
  monthlyBudgetApprox: string;
  suggestedTargetRoas: string;
  roasDescription: string;
  facebookDiagnosis: string;
  diagnosisDescription: string;
  startFacebookDiagnosis: string;
  analyzing: string;
  diagnosisResults: string;
  account: string;
  healthScore: string;
  recommendations: string;
  
  // Facebook Audit
  fbAuditTitle: string;
  fbAuditDescription: string;
  fbAuditSubtitle: string;
  fbAuditStep1: string;
  fbAuditStep2: string;
  fbAuditStep3: string;
  fbAuditStep4: string;
  connectFacebook: string;
  selectAdAccount: string;
  selectCampaignPlan: string;
  selectIndustry: string;
  startHealthCheck: string;
  healthCheckProgress: string;
  healthCheckComplete: string;
  healthCheckResults: string;
  aiRecommendations: string;
  overallScore: string;
  analysisResults: string;
  achieved: string;
  notAchieved: string;
  needsImprovement: string;
  excellent: string;
  good: string;
  poor: string;
  ratingQuestion: string;
  ratingLow: string;
  ratingMedium: string;
  ratingHigh: string;
  commentPlaceholder: string;
  submitRating: string;
  thankYouMessage: string;
  
  // Additional FB Audit translations
  connectFacebookPrompt: string;
  facebookConnected: string;
  nextSelectAccount: string;
  selectAccountPrompt: string;
  noAccountsFound: string;
  nextSelectPlan: string;
  selectPlanPrompt: string;
  noPlansFound: string;
  nextSelectIndustry: string;
  selectIndustryPrompt: string;
  runHealthCheck: string;
  runStreamHealthCheck: string;
  fetchingData: string;
  analyzingMetrics: string;
  generatingRecommendations: string;
  processingComplete: string;
  healthCheckRunning: string;
  currentProgress: string;
  waitingResults: string;
  runAgain: string;
  backToDashboard: string;
  metric: string;
  target: string;
  actual: string;
  status: string;
  recommendation: string;
  loadingAccounts: string;
  loadingPlans: string;
  pleaseSelect: string;
  createPlanFirst: string;
  
  // Security and analysis messages
  securityNotice: string;
  analyzingYourData: string;
  analyzingDescription: string;
  resultsBasedOn: string;
  tipTitle: string;
  tipMessage: string;
  
  // Additional UI messages
  loginRequired: string;
  healthCheckFailed: string;
  confirmFbPermissions: string;
  errorEncountered: string;
  fbSetupGuide: string;
  nextSelectBudgetPlan: string;
  nextSelectIndustryType: string;
  selectAdAccountStep: string;
  selectPlanStep: string;
  selectIndustryStep: string;
  
  // Pricing Page
  pricing: string;
  pricingTitle: string;
  pricingSubtitle: string;
  whyChoose: string;
  whyChooseSubtitle: string;
  simplePricing: string;
  simplePricingSubtitle: string;
  monthlyPlan: string;
  lifetimePlan: string;
  popularPlan: string;
  bestValue: string;
  limitedSale: string;
  getStarted: string;
  buyNow: string;
  planComparison: string;
  planComparisonSubtitle: string;
  features: string;
  monthlyCredits: string;
  priorityAccess: string;
  creditDiscount: string;
  dedicatedSupport: string;
  basicSupport: string;
  specialDiscount: string;
  getStartedToday: string;
  getStartedTodaySubtitle: string;
  tryMonthly: string;
  buyLifetime: string;
  
  // About Us Page
  about: {
    title: string;
    subtitle: string;
    mission: {
      title: string;
      problem: string;
      solution: string;
      platform: string;
      outcome: string;
    };
    founder: {
      title: string;
      intro: string;
      experience: string;
      philosophy: string;
      vision: string;
      conclusion: string;
    };
    company: {
      title: string;
      description: string;
      mission: string;
      courses_intro: string;
      course1: {
        title: string;
        description: string;
      };
      course2: {
        title: string;
        description: string;
      };
      course3: {
        title: string;
        description: string;
      };
      japan_office: string;
    };
    message: {
      title: string;
      growth: string;
      conclusion: string;
    };
    cta: {
      title: string;
      description: string;
      calculator: string;
      fbaudit: string;
      campaign_planner: string;
    };
  };
}

const translations: Record<Locale, TranslationData> = {
  'zh-TW': {
    // Navigation
    home: '首頁',
    calculator: '預算計算機',
    campaignPlanner: '活動預算規劃器',
    privacy: '隱私政策',
    terms: '服務條款',
    
    // Authentication
    loginWithGoogle: '使用 Google 登入',
    logout: '登出',
    login: '登入',
    
    // Calculator
    calculatorTitle: '廣告預算怎麼抓｜報數據來告訴你FB, IG廣告預算流量要多少',
    calculatorDescription: '根據您的目標營收、平均訂單價值和轉換率，計算所需的廣告預算',
    monthlyRevenue: '目標月營收',
    averageOrderValue: '平均訂單價值',
    conversionRate: '轉換率',
    costPerClick: '每次點擊成本',
    calculate: '計算',
    results: '計算結果',
    requiredOrders: '所需訂單數',
    requiredTraffic: '所需流量',
    monthlyAdBudget: '月廣告預算',
    dailyAdBudget: '日廣告預算',
    
    // Campaign Planner
    campaignPlannerDescription: '專業的活動預算規劃工具，制定完整活動策略',
    
    // Common
    loading: '載入中...',
    error: '錯誤',
    submit: '提交',
    cancel: '取消',
    save: '儲存',
    delete: '刪除',
    edit: '編輯',
    
    // Footer
    companyName: '煜言顧問有限公司(TW) / 燈言顧問株式会社(JP)',
    allRightsReserved: '版權所有',
    courseLink: 'PressPlay 課程',
    
    // Units
    currency: 'NTD',
    percentage: '%',
    orders: '筆',
    visitors: '人',
    cpcValue: 5,
    
    // Pricing navigation label
    pricingLabel: '價格方案',
    
    // Pricing
    pricing: {
      monthlyPlan: '月訂閱',
      lifetimePlan: '終身訂閱',
      monthlyPrice: 'NT$690',
      lifetimePrice: 'NT$5,990',
      perMonth: '每月',
      oneTime: '一次付清',
      currency: 'TWD',
      features: {
        allFeatures: '所有功能',
        prioritySupport: '優先支援',
        monthlyCredits: '月度積分',
        advancedAnalytics: '進階分析',
        lifetimeAccess: '終身使用',
        unlimitedCredits: '無限積分'
      }
    },
    
    // Meta
    metaTitle: '廣告預算怎麼抓｜報數據來告訴你FB, IG廣告預算流量要多少',
    metaDescription: '免費電商廣告預算計算器！輸入目標營收、平均客單價和轉換率，立即算出Facebook、Instagram廣告每日預算和所需流量。適合電商老闆快速評估廣告投放成本。',
    
    // GA Integration
    gaIntegration: 'Google Analytics 整合',
    gaLogin: '連接 Google Analytics',
    gaSelectProperty: '選擇 GA 資源',
    gaAutoFill: '自動填入數據',
    
    // Brevo Integration
    emailSaved: '電子郵件已儲存',
    emailSaveError: '儲存電子郵件時發生錯誤',
    
    // Referral System
    referralDescription: '分享您的專屬連結，每當有朋友透過連結註冊並登入，雙方都能獲得 5 Credits！',
    shareText: '我在用「報數據」計算廣告預算，超好用！透過我的連結註冊，我們都能獲得 5 Credits：',
    
    // Membership System
    freeMember: 'Free 會員',
    proMember: 'Pro 會員',
    upgradeToPro: '升級至 Pro',
    membershipExpires: '會員有效期至',
    insufficientCredits: '積分不足',
    upgradeSuccess: '升級成功！歡迎成為 Pro 會員',
    upgradeError: '升級失敗，請稍後再試',
    
    // Footer
    blog: '部落格',
    
    // Facebook Audit
    fbAuditTitle: 'Facebook 廣告健檢',
    fbAuditDescription: '專業的 Facebook 廣告成效分析工具，由小黑老師 AI 提供智能診斷建議',
    fbAuditSubtitle: '透過 AI 智能分析，為您的 Facebook 廣告提供專業健檢服務',
    fbAuditStep1: '步驟 1：連接 Facebook',
    fbAuditStep2: '步驟 2：選擇廣告帳戶',
    fbAuditStep3: '步驟 3：選擇活動計劃',
    fbAuditStep4: '步驟 4：選擇行業類型',
    connectFacebook: '連接 Facebook',
    selectAdAccount: '選擇廣告帳戶',
    selectCampaignPlan: '選擇活動計劃',
    selectIndustry: '選擇行業類型',
    startHealthCheck: '開始健檢',
    healthCheckProgress: '健檢進行中...',
    healthCheckComplete: '健檢完成',
    healthCheckResults: '健檢結果',
    aiRecommendations: '小黑老師 AI 建議',
    overallScore: '整體評分',
    analysisResults: '分析結果',
    achieved: '達成',
    notAchieved: '未達成',
    needsImprovement: '需要改善',
    excellent: '優秀',
    good: '良好',
    poor: '待改善',
    ratingQuestion: '你覺得這個 AI 建議工具，你會推薦給你的朋友使用嗎？',
    ratingLow: '一定不會',
    ratingMedium: '可能',
    ratingHigh: '非常可能',
    commentPlaceholder: '您的寶貴意見（選填）',
    submitRating: '提交評分',
    thankYouMessage: '感謝您的評分！您的意見對我們非常重要。',
    
    // Additional FB Audit translations
    connectFacebookPrompt: '請先連接您的 Facebook 廣告帳戶',
    facebookConnected: 'Facebook 廣告已連接',
    nextSelectAccount: '下一步：選擇廣告帳戶',
    selectAccountPrompt: '請選擇您要分析的廣告帳戶',
    noAccountsFound: '未找到廣告帳戶',
    nextSelectPlan: '下一步：選擇活動計劃',
    selectPlanPrompt: '請選擇您要分析的活動計劃',
    noPlansFound: '未找到活動計劃',
    nextSelectIndustry: '下一步：選擇行業類型',
    selectIndustryPrompt: '請選擇您的行業類型',
    runHealthCheck: '執行健檢',
    runStreamHealthCheck: '執行即時健檢',
    fetchingData: '正在取得資料...',
    analyzingMetrics: '正在分析指標...',
    generatingRecommendations: '正在生成建議...',
    processingComplete: '處理完成',
    healthCheckRunning: '健檢執行中',
    currentProgress: '目前進度',
    waitingResults: '等待結果中...',
    runAgain: '重新執行健檢',
    backToDashboard: '返回儀表板',
    metric: '指標',
    target: '目標',
    actual: '實際',
    status: '狀態',
    recommendation: '建議',
    loadingAccounts: '正在載入廣告帳戶...',
    loadingPlans: '正在載入計劃...',
    pleaseSelect: '請選擇',
    createPlanFirst: '請先建立計劃',
    
    // Security and analysis messages
    securityNotice: '我們僅會讀取您的廣告數據，不會進行任何設定變更。數據安全是我們的首要考量。',
    analyzingYourData: '正在分析您的廣告數據',
    analyzingDescription: '我們正在分析您過去 28 天的廣告數據，請稍候...',
    resultsBasedOn: '基於過去 28 天的廣告數據分析',
    tipTitle: '💡 小提示',
    tipMessage: '廣告創意的 CTR 越高，通常 CPC 就越低。',
    
    // Additional UI messages
    loginRequired: '請先登入以使用廣告健檢功能',
    healthCheckFailed: '健檢執行失敗，請檢查控制台錯誤信息',
    confirmFbPermissions: '請確認您的 Facebook 帳號有廣告管理權限',
    errorEncountered: '遇到「無法使用此功能」的錯誤嗎？',
    fbSetupGuide: '📋 查看 Facebook 應用程式設定指南',
    nextSelectBudgetPlan: '下一步：選擇預算計劃',
    nextSelectIndustryType: '下一步：選擇產業類型',
    selectAdAccountStep: '步驟 2: 選擇廣告帳號',
    selectPlanStep: '步驟 3: 選擇預算計劃',
    selectIndustryStep: '步驟 4: 選擇產業類型',
    
    // Calculator Page Additional
    connectAccountTitle: '連接帳戶以使用完整功能',
    connectAccountDescription: '需要同時連接 Google Analytics 和 Facebook 廣告帳戶才能使用所有功能',
    googleAnalytics: 'Google Analytics',
    facebookAds: 'Facebook 廣告',
    connected: '已連接',
    notConnected: '未連接',
    targetRevenuePlaceholder: '例如：300000',
    aovPlaceholder: '例如：1500',
    conversionRatePlaceholder: '例如：2.5',
    targetMonthlyRevenue: '目標月營收',
    targetMonthlyRevenueUnit: '元',
    averageOrderValueUnit: '元',
    conversionRateUnit: '%',
    calculateBudget: '計算預算',
    calculationResults: '計算結果',
    monthlyRequiredOrders: '每月所需訂單數',
    ordersUnit: '筆',
    dailyApprox: '每日約',
    monthlyRequiredTraffic: '每月所需流量',
    visitorsUnit: '人次',
    suggestedDailyBudget: '建議日廣告預算',
    monthlyBudgetApprox: '月預算約',
    suggestedTargetRoas: '建議目標 ROAS',
    roasDescription: '每投入 1 元廣告費，應產生 {roas} 元營收',
    facebookDiagnosis: 'Facebook 廣告健檢',
    diagnosisDescription: '連接 Facebook 廣告帳戶後，點擊下方按鈕開始診斷分析',
    startFacebookDiagnosis: '開始 Facebook 廣告診斷',
    analyzing: '分析中...',
    diagnosisResults: '診斷結果',
    account: '帳戶',
    healthScore: '健康分數',
    recommendations: '建議',
    
    // Pricing Page
    pricingTitle: '報數據 Premium',
    pricingSubtitle: '專業級分析工具，最大化您的廣告投資回報',
    whyChoose: '為什麼選擇報數據？',
    whyChooseSubtitle: '數據驅動行銷的全新標準',
    simplePricing: '簡單透明的價格結構',
    simplePricingSubtitle: '選擇最適合您需求的方案',
    monthlyPlan: '月訂閱方案',
    lifetimePlan: '終身訂閱',
    popularPlan: '熱門方案',
    bestValue: '最超值',
    limitedSale: '限時特價中',
    getStarted: '立即開始',
    buyNow: '立即購買',
    planComparison: '方案比較',
    planComparisonSubtitle: '各方案詳細功能比較',
    features: '功能',
    monthlyCredits: '每月點數',
    priorityAccess: '新功能優先使用',
    creditDiscount: '點數使用折扣',
    dedicatedSupport: '專屬客服',
    basicSupport: '基本客服',
    specialDiscount: '特別折扣',
    getStartedToday: '立即開始使用',
    getStartedTodaySubtitle: '限時特價中，機會難得',
    tryMonthly: '試用月訂閱',
    buyLifetime: '購買終身版',
    
    // About Us Page
    about: {
      title: '關於我們',
      subtitle: '讓廣告操作者，擁有看懂數據與主導策略的能力。',
      mission: {
        title: '我們為什麼打造《報數據》？',
        problem: '很多人以為，Facebook 廣告就是會操作廣告後台。但我們知道，真正有價值的投手，不只是點幾個按鈕就能變專業。',
        solution: '我們打造《報數據》，就是想讓更多行銷人員不只是「系統操作者」，而是能夠獨立企劃、拆解成效、提出優化建議的廣告策略專家。',
        platform: '這個平台，從 GA 數據到 Facebook 廣告指標，整合我十幾年實戰經驗，幫助你看懂每個成效背後的意義。不再靠運氣亂投，也不再在報表前面一片空白。',
        outcome: '你會知道怎麼規劃預算，怎麼追蹤 ROAS，怎麼成為讓老闆願意加薪、客戶願意信任的人。'
      },
      founder: {
        title: '創辦人介紹｜邱煜庭（小黑）',
        intro: '你可能在某堂課上看過我、在某篇貼文裡讀過我說的話，但如果真的要介紹我自己，那應該是這樣：',
        experience: '我從 Facebook 廣告一問世就開始投入這個產業，從一人小工作室到跨國集團，從 1 萬預算到 1,000 萬規模，幾乎什麼產業都做過一些。這些年來，我見過太多優秀的行銷人，卡在「找不到人問」「不知道怎麼做」的焦慮裡。',
        philosophy: '我常開玩笑說，我這個人不好找、也不愛回訊息，所以我就想，能不能有更多「我的分身」，陪著你度過那些深夜一個人面對報表的時候。',
        vision: '《報數據》，就是這樣一個存在。',
        conclusion: '它不只是工具，它是你背後的邏輯支援，是幫你找破口、出建議的策略顧問。'
      },
      company: {
        title: '我們是誰？',
        description: '《報數據》由煜言顧問有限公司（台灣）與燈言顧問株式会社（日本）共同開發與營運。這兩家公司，也正是我們線上課程「燒賣研究所」的法人實體與技術支援。',
        mission: '我們的核心任務很簡單——把實戰經驗變成可以落地使用的策略工具，幫助更多廣告操作者走得更遠。',
        courses_intro: '目前我們在 PressPlay Academy 上的代表性課程包括：',
        course1: {
          title: '電商結構學',
          description: '從商業模式與定位切入，建立可長可短的廣告策略骨架'
        },
        course2: {
          title: 'FB 廣告自學攻略',
          description: '為初學者量身打造的系統教學'
        },
        course3: {
          title: 'FB 廣告成效攻略',
          description: '針對進階投手的數據解讀與策略提案訓練'
        },
        japan_office: '而我們在日本設立的「燈言顧問」，則希望成為台灣品牌進軍日本市場的橋樑，提供更在地的行銷建議與顧問資源。'
      },
      message: {
        title: '想對你說的話',
        growth: '如果你正想靠廣告轉職、升職、接案，甚至創業，那我們希望《報數據》可以成為你每一步成長過程裡最可靠的夥伴。',
        conclusion: '這不會是你操作後台的替代品，而是幫你做出更聰明決策的副駕駛。'
      },
      cta: {
        title: '立即開始使用報數據',
        description: '選擇最適合你的工具，開始你的廣告優化之旅',
        calculator: '廣告預算計算機',
        fbaudit: 'FB 廣告健檢',
        campaign_planner: '活動預算規劃師'
      }
    }
  },
  
  'en': {
    // Navigation
    home: 'Home',
    calculator: 'Budget Calculator',
    campaignPlanner: 'Campaign Planner',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    
    // Authentication
    loginWithGoogle: 'Sign in with Google',
    logout: 'Sign out',
    login: 'Sign in',
    
    // Calculator
    calculatorTitle: 'How to Set Ad Budget | Report Data tells you FB, IG ad budget and traffic requirements',
    calculatorDescription: 'Calculate your required advertising budget based on target revenue, average order value, and conversion rate',
    monthlyRevenue: 'Target Monthly Revenue',
    averageOrderValue: 'Average Order Value',
    conversionRate: 'Conversion Rate',
    costPerClick: 'Cost Per Click',
    calculate: 'Calculate',
    results: 'Results',
    requiredOrders: 'Required Orders',
    requiredTraffic: 'Required Traffic',
    monthlyAdBudget: 'Monthly Ad Budget',
    dailyAdBudget: 'Daily Ad Budget',
    
    // Campaign Planner  
    campaignPlannerDescription: 'Professional campaign planning tool for complete strategy',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    
    // Footer
    companyName: 'YuYan Consulting Co., Ltd. (TW) / Togen Consulting Co., Ltd. (JP)',
    allRightsReserved: 'All Rights Reserved',
    courseLink: 'PressPlay Course',
    
    // Units
    currency: 'USD',
    percentage: '%',
    orders: 'orders',
    visitors: 'visitors',
    cpcValue: 1,
    
    // Pricing navigation label
    pricingLabel: 'Pricing',
    
    // Pricing
    pricing: {
      monthlyPlan: 'Monthly Plan',
      lifetimePlan: 'Lifetime Plan',
      monthlyPrice: '$19',
      lifetimePrice: '$169',
      perMonth: 'per month',
      oneTime: 'one time',
      currency: 'USD',
      features: {
        allFeatures: 'All Features',
        prioritySupport: 'Priority Support',
        monthlyCredits: 'Monthly Credits',
        advancedAnalytics: 'Advanced Analytics',
        lifetimeAccess: 'Lifetime Access',
        unlimitedCredits: 'Unlimited Credits'
      }
    },
    
    // Meta
    metaTitle: 'How to Set Ad Budget | Report Data tells you FB, IG ad budget and traffic requirements',
    metaDescription: 'Free e-commerce advertising budget calculator! Enter target revenue, average order value, and conversion rate to instantly calculate Facebook and Instagram daily ad budget and required traffic. Perfect for e-commerce owners to quickly assess advertising costs.',
    
    // GA Integration
    gaIntegration: 'Google Analytics Integration',
    gaLogin: 'Connect Google Analytics',
    gaSelectProperty: 'Select GA Property',
    gaAutoFill: 'Auto-fill Data',
    
    // Brevo Integration
    emailSaved: 'Email saved',
    emailSaveError: 'Error saving email',
    
    // Referral System
    referralDescription: 'Share your exclusive link - when friends register and login through your link, both of you get 5 Credits!',
    shareText: 'I\'m using "Report Data" for ad budget calculations - it\'s amazing! Register through my link and we both get 5 Credits:',
    
    // Membership System
    freeMember: 'Free Member',
    proMember: 'Pro Member',
    upgradeToPro: 'Upgrade to Pro',
    membershipExpires: 'Membership expires on',
    insufficientCredits: 'Insufficient credits',
    upgradeSuccess: 'Upgrade successful! Welcome to Pro membership',
    upgradeError: 'Upgrade failed, please try again later',
    
    // Footer
    blog: 'Blog',
    
    // Facebook Audit
    fbAuditTitle: 'Facebook Ads Health Check',
    fbAuditDescription: 'Professional Facebook ads performance analysis tool with AI-powered diagnostic recommendations by Teacher Black',
    fbAuditSubtitle: 'Get professional health check service for your Facebook ads through AI intelligent analysis',
    fbAuditStep1: 'Step 1: Connect Facebook',
    fbAuditStep2: 'Step 2: Select Ad Account',
    fbAuditStep3: 'Step 3: Select Campaign Plan',
    fbAuditStep4: 'Step 4: Select Industry Type',
    connectFacebook: 'Connect Facebook',
    selectAdAccount: 'Select Ad Account',
    selectCampaignPlan: 'Select Campaign Plan',
    selectIndustry: 'Select Industry Type',
    startHealthCheck: 'Start Health Check',
    healthCheckProgress: 'Health Check in Progress...',
    healthCheckComplete: 'Health Check Complete',
    healthCheckResults: 'Health Check Results',
    aiRecommendations: 'Teacher Black AI Recommendations',
    overallScore: 'Overall Score',
    analysisResults: 'Analysis Results',
    achieved: 'Achieved',
    notAchieved: 'Not Achieved',
    needsImprovement: 'Needs Improvement',
    excellent: 'Excellent',
    good: 'Good',
    poor: 'Needs Improvement',
    ratingQuestion: 'Would you recommend this AI recommendation tool to your friends?',
    ratingLow: 'Definitely not',
    ratingMedium: 'Maybe',
    ratingHigh: 'Very likely',
    commentPlaceholder: 'Your valuable feedback (optional)',
    submitRating: 'Submit Rating',
    thankYouMessage: 'Thank you for your rating! Your feedback is very important to us.',
    
    // Additional FB Audit translations
    connectFacebookPrompt: 'Please connect your Facebook Ad account first',
    facebookConnected: 'Facebook Ads Connected',
    nextSelectAccount: 'Next: Select Ad Account',
    selectAccountPrompt: 'Please select the ad account you want to analyze',
    noAccountsFound: 'No ad accounts found',
    nextSelectPlan: 'Next: Select Campaign Plan',
    selectPlanPrompt: 'Please select the campaign plan you want to analyze',
    noPlansFound: 'No campaign plans found',
    nextSelectIndustry: 'Next: Select Industry Type',
    selectIndustryPrompt: 'Please select your industry type',
    runHealthCheck: 'Run Health Check',
    runStreamHealthCheck: 'Run Real-time Health Check',
    fetchingData: 'Fetching data...',
    analyzingMetrics: 'Analyzing metrics...',
    generatingRecommendations: 'Generating recommendations...',
    processingComplete: 'Processing complete',
    healthCheckRunning: 'Health check running',
    currentProgress: 'Current progress',
    waitingResults: 'Waiting for results...',
    runAgain: 'Run Health Check Again',
    backToDashboard: 'Back to Dashboard',
    metric: 'Metric',
    target: 'Target',
    actual: 'Actual',
    status: 'Status',
    recommendation: 'Recommendation',
    loadingAccounts: 'Loading ad accounts...',
    loadingPlans: 'Loading plans...',
    pleaseSelect: 'Please select',
    createPlanFirst: 'Create plan first',
    
    // Security and analysis messages
    securityNotice: 'We only read your advertising data and never make any configuration changes. Data security is our top priority.',
    analyzingYourData: 'Analyzing your advertising data',
    analyzingDescription: 'We are analyzing your advertising data from the past 28 days, please wait...',
    resultsBasedOn: 'Based on advertising data analysis from the past 28 days',
    tipTitle: '💡 Tip',
    tipMessage: 'The higher the CTR of your ad creative, the lower the CPC usually is.',
    
    // Additional UI messages
    loginRequired: 'Please login to use the ad health check feature',
    healthCheckFailed: 'Health check failed, please check console error messages',
    confirmFbPermissions: 'Please confirm your Facebook account has advertising management permissions',
    errorEncountered: 'Encountered "Cannot use this feature" error?',
    fbSetupGuide: '📋 View Facebook Application Setup Guide',
    nextSelectBudgetPlan: 'Next: Select Budget Plan',
    nextSelectIndustryType: 'Next: Select Industry Type',
    selectAdAccountStep: 'Step 2: Select Ad Account',
    selectPlanStep: 'Step 3: Select Budget Plan',
    selectIndustryStep: 'Step 4: Select Industry Type',
    
    // Calculator Page Additional
    connectAccountTitle: 'Connect Accounts for Full Features',
    connectAccountDescription: 'Connect both Google Analytics and Facebook Ad accounts to access all features',
    googleAnalytics: 'Google Analytics',
    facebookAds: 'Facebook Ads',
    connected: 'Connected',
    notConnected: 'Not Connected',
    targetRevenuePlaceholder: 'e.g., 10000',
    aovPlaceholder: 'e.g., 50',
    conversionRatePlaceholder: 'e.g., 2.5',
    targetMonthlyRevenue: 'Target Monthly Revenue',
    targetMonthlyRevenueUnit: 'USD',
    averageOrderValueUnit: 'USD',
    conversionRateUnit: '%',
    calculateBudget: 'Calculate Budget',
    calculationResults: 'Calculation Results',
    monthlyRequiredOrders: 'Monthly Required Orders',
    ordersUnit: 'orders',
    dailyApprox: 'Daily approx.',
    monthlyRequiredTraffic: 'Monthly Required Traffic',
    visitorsUnit: 'visitors',
    suggestedDailyBudget: 'Suggested Daily Budget',
    monthlyBudgetApprox: 'Monthly budget approx.',
    suggestedTargetRoas: 'Suggested Target ROAS',
    roasDescription: 'For every $1 spent on ads, should generate ${roas} in revenue',
    facebookDiagnosis: 'Facebook Ad Health Check',
    diagnosisDescription: 'After connecting Facebook Ad account, click the button below to start diagnostic analysis',
    startFacebookDiagnosis: 'Start Facebook Ad Diagnosis',
    analyzing: 'Analyzing...',
    diagnosisResults: 'Diagnosis Results',
    account: 'Account',
    healthScore: 'Health Score',
    recommendations: 'Recommendations',
    
    // Pricing Page
    pricingTitle: 'Report Data Premium',
    pricingSubtitle: 'Professional-grade analytics tools to maximize your ad investment',
    whyChoose: 'Why Choose Report Data?',
    whyChooseSubtitle: 'The new standard for data-driven marketing',
    simplePricing: 'Simple Pricing Structure',
    simplePricingSubtitle: 'Choose from two plans that fit your needs',
    monthlyPlan: 'Monthly Plan',
    lifetimePlan: 'Lifetime Plan',
    popularPlan: 'Popular Plan',
    bestValue: 'Best Value',
    limitedSale: 'Limited Time Sale',
    getStarted: 'Get Started',
    buyNow: 'Buy Now',
    planComparison: 'Plan Comparison',
    planComparisonSubtitle: 'Detailed feature comparison for each plan',
    features: 'Features',
    monthlyCredits: 'Monthly Credits',
    priorityAccess: 'Priority Access to New Features',
    creditDiscount: 'Credit Usage Discount',
    dedicatedSupport: 'Dedicated Support',
    basicSupport: 'Basic Support',
    specialDiscount: 'Special Discount',
    getStartedToday: 'Get Started Today',
    getStartedTodaySubtitle: 'Limited time sale - don\'t miss this opportunity',
    tryMonthly: 'Try Monthly Plan',
    buyLifetime: 'Buy Lifetime',
    
    // About Us Page
    about: {
      title: 'About Us',
      subtitle: 'Empowering advertisers with data understanding and strategic leadership capabilities.',
      mission: {
        title: 'Why We Built "Report Data"?',
        problem: 'Many people think Facebook advertising is just about operating the ad backend. But we know that truly valuable marketers are more than just clicking buttons to become professionals.',
        solution: 'We built "Report Data" to help more marketing professionals become not just "system operators," but advertising strategy experts who can independently plan, analyze performance, and provide optimization recommendations.',
        platform: 'This platform integrates my decades of practical experience, from GA data to Facebook advertising metrics, helping you understand the meaning behind every performance metric. No more random spending based on luck, no more blank stares at reports.',
        outcome: 'You\'ll know how to plan budgets, track ROAS, and become someone your boss wants to promote and clients want to trust.'
      },
      founder: {
        title: 'Founder Introduction | Qiu Yu-Ting (Mr.Kuro)',
        intro: 'You might have seen me in a class or read something I wrote in a post, but if I really had to introduce myself, it would be like this:',
        experience: 'I\'ve been involved in this industry since Facebook advertising first launched, from one-person studios to multinational corporations, from 10,000 budgets to 10-million scale, across almost every industry. Over the years, I\'ve seen too many excellent marketers stuck in the anxiety of "can\'t find anyone to ask" and "don\'t know how to do it."',
        philosophy: 'I often joke that I\'m hard to find and don\'t like replying to messages, so I thought, could there be more "versions of me" to accompany you through those late nights facing reports alone?',
        vision: '"Report Data" is exactly that kind of existence.',
        conclusion: 'It\'s not just a tool, it\'s the logical support behind you, the strategy consultant that helps you find breakthroughs and provides recommendations.'
      },
      company: {
        title: 'Who Are We?',
        description: '"Report Data" is jointly developed and operated by YuYan Consulting Co., Ltd. (Taiwan) and Togen Consulting Co., Ltd. (Japan). These two companies are also the legal entities and technical support for our online course "Shumai Research Institute."',
        mission: 'Our core mission is simple—turn practical experience into actionable strategic tools to help more advertising operators go further.',
        courses_intro: 'Our representative courses on PressPlay Academy currently include:',
        course1: {
          title: 'E-commerce Structure Studies',
          description: 'Starting from business model and positioning, building long-term and short-term advertising strategy frameworks'
        },
        course2: {
          title: 'FB Advertising Self-Learning Guide',
          description: 'Systematic teaching tailored for beginners'
        },
        course3: {
          title: 'FB Advertising Performance Guide',
          description: 'Data interpretation and strategy proposal training for advanced marketers'
        },
        japan_office: 'Our "Togen Consulting" established in Japan hopes to become a bridge for Taiwanese brands entering the Japanese market, providing more localized marketing advice and consulting resources.'
      },
      message: {
        title: 'What We Want to Tell You',
        growth: 'If you\'re looking to change careers, get promoted, freelance, or even start a business through advertising, we hope "Report Data" can become your most reliable partner in every step of your growth journey.',
        conclusion: 'This won\'t replace your backend operations, but it will be your co-pilot in making smarter decisions.'
      },
      cta: {
        title: 'Start Using Report Data Now',
        description: 'Choose the tool that suits you best and begin your advertising optimization journey',
        calculator: 'Ad Budget Calculator',
        fbaudit: 'FB Ad Health Check',
        campaign_planner: 'Campaign Planner'
      }
    }
  },
  
  'ja': {
    // Navigation
    home: 'ホーム',
    calculator: '予算計算機',
    campaignPlanner: 'キャンペーンプランナー',
    privacy: 'プライバシーポリシー',
    terms: '利用規約',
    
    // Authentication
    loginWithGoogle: 'Googleでログイン',
    logout: 'ログアウト',
    login: 'ログイン',
    
    // Calculator
    calculatorTitle: '広告予算の決め方｜レポートデータがFB・IG広告予算とトラフィック要件をお教えします',
    calculatorDescription: '目標売上、平均注文額、コンバージョン率に基づいて必要な広告予算を計算します',
    monthlyRevenue: '目標月間売上',
    averageOrderValue: '平均注文額',
    conversionRate: 'コンバージョン率',
    costPerClick: 'クリック単価',
    calculate: '計算',
    results: '計算結果',
    requiredOrders: '必要注文数',
    requiredTraffic: '必要トラフィック',
    monthlyAdBudget: '月次広告予算',
    dailyAdBudget: '日次広告予算',
    
    // Campaign Planner
    campaignPlannerDescription: '包括的な戦略のためのプロフェッショナルキャンペーン計画ツール',
    
    // Common
    loading: '読み込み中...',
    error: 'エラー',
    submit: '送信',
    cancel: 'キャンセル',
    save: '保存',
    delete: '削除',
    edit: '編集',
    
    // Footer
    companyName: '煜言顧問有限公司(台湾) / 燈言顧問株式会社(日本)',
    allRightsReserved: '全著作権所有',
    courseLink: 'PressPlayコース',
    
    // Units
    currency: 'JPY',
    percentage: '%',
    orders: '件',
    visitors: '人',
    cpcValue: 120,
    
    // Pricing navigation label
    pricingLabel: '料金プラン',
    
    // Pricing
    pricing: {
      monthlyPlan: '月額プラン',
      lifetimePlan: 'ライフタイムプラン',
      monthlyPrice: '¥2,000',
      lifetimePrice: '¥17,250',
      perMonth: '月額',
      oneTime: '買い切り',
      currency: 'JPY',
      features: {
        allFeatures: '全機能',
        prioritySupport: '優先サポート',
        monthlyCredits: '月間クレジット',
        advancedAnalytics: '高度な分析',
        lifetimeAccess: '生涯利用',
        unlimitedCredits: '無制限クレジット'
      }
    },
    
    // Meta
    metaTitle: '広告予算の決め方｜レポートデータがFB・IG広告予算とトラフィック要件をお教えします',
    metaDescription: '無料のeコマース広告予算計算機！目標売上、平均注文額、コンバージョン率を入力してFacebookとInstagramの日次広告予算と必要トラフィックを即座に計算。eコマース事業者が広告費用を素早く評価するのに最適。',
    
    // GA Integration
    gaIntegration: 'Google Analytics連携',
    gaLogin: 'Google Analyticsに接続',
    gaSelectProperty: 'GAプロパティを選択',
    gaAutoFill: 'データ自動入力',
    
    // Brevo Integration
    emailSaved: 'メールアドレスが保存されました',
    emailSaveError: 'メールアドレスの保存中にエラーが発生しました',
    
    // Referral System
    referralDescription: 'あなた専用のリンクをシェアしましょう！友達がリンク経由で登録・ログインすると、お互いに5クレジットがもらえます！',
    shareText: '私は「報数據」で広告予算の計算をしています。とても便利です！私のリンクから登録すると、お互いに5クレジットがもらえます：',
    
    // Membership System
    freeMember: 'フリー会員',
    proMember: 'プロ会員',
    upgradeToPro: 'プロにアップグレード',
    membershipExpires: '会員有効期限',
    insufficientCredits: 'クレジット不足',
    upgradeSuccess: 'アップグレード成功！プロ会員へようこそ',
    upgradeError: 'アップグレードに失敗しました。後でもう一度お試しください',
    
    // Footer
    blog: 'ブログ',
    
    // Facebook Audit
    fbAuditTitle: 'Facebook広告健康診断',
    fbAuditDescription: '小黒先生AIによる知能診断とアドバイス付きのプロフェッショナルなFacebook広告パフォーマンス分析ツール',
    fbAuditSubtitle: 'AI知能分析によって、Facebook広告の専門的なヘルスチェックサービスを提供',
    fbAuditStep1: 'ステップ1：Facebook接続',
    fbAuditStep2: 'ステップ2：広告アカウント選択',
    fbAuditStep3: 'ステップ3：キャンペーンプラン選択',
    fbAuditStep4: 'ステップ4：業界タイプ選択',
    connectFacebook: 'Facebook接続',
    selectAdAccount: '広告アカウント選択',
    selectCampaignPlan: 'キャンペーンプラン選択',
    selectIndustry: '業界タイプ選択',
    startHealthCheck: 'ヘルスチェック開始',
    healthCheckProgress: 'ヘルスチェック実行中...',
    healthCheckComplete: 'ヘルスチェック完了',
    healthCheckResults: 'ヘルスチェック結果',
    aiRecommendations: '小黒先生AIレコメンデーション',
    overallScore: '総合スコア',
    analysisResults: '分析結果',
    achieved: '達成',
    notAchieved: '未達成',
    needsImprovement: '改善が必要',
    excellent: '優秀',
    good: '良好',
    poor: '改善が必要',
    ratingQuestion: 'このAI推薦ツールを友達に推薦しますか？',
    ratingLow: '絶対にしない',
    ratingMedium: 'たぶん',
    ratingHigh: '非常に可能性が高い',
    commentPlaceholder: '貴重なご意見（任意）',
    submitRating: '評価を送信',
    thankYouMessage: '評価をありがとうございます！あなたのフィードバックは私たちにとって非常に重要です。',
    
    // Calculator Page Additional
    connectAccountTitle: '完全な機能を使用するためにアカウントを接続',
    connectAccountDescription: 'すべての機能にアクセスするにはGoogle AnalyticsとFacebook広告アカウントの両方を接続する必要があります',
    googleAnalytics: 'Google Analytics',
    facebookAds: 'Facebook広告',
    connected: '接続済み',
    notConnected: '未接続',
    targetRevenuePlaceholder: '例：1000000',
    aovPlaceholder: '例：6000',
    conversionRatePlaceholder: '例：2.5',
    targetMonthlyRevenue: '目標月間売上',
    targetMonthlyRevenueUnit: '円',
    averageOrderValueUnit: '円',
    conversionRateUnit: '%',
    calculateBudget: '予算計算',
    calculationResults: '計算結果',
    monthlyRequiredOrders: '月間必要注文数',
    ordersUnit: '件',
    dailyApprox: '日次約',
    monthlyRequiredTraffic: '月間必要トラフィック',
    visitorsUnit: '訪問者',
    suggestedDailyBudget: '推奨日次予算',
    monthlyBudgetApprox: '月次予算約',
    suggestedTargetRoas: '推奨目標ROAS',
    roasDescription: '広告費1円あたり{roas}円の収益を生み出す必要があります',
    facebookDiagnosis: 'Facebook広告健康診断',
    diagnosisDescription: 'Facebook広告アカウント接続後、下のボタンをクリックして診断分析を開始',
    startFacebookDiagnosis: 'Facebook広告診断開始',
    analyzing: '分析中...',
    diagnosisResults: '診断結果',
    account: 'アカウント',
    healthScore: '健康スコア',
    recommendations: '推奨事項',
    
    // Additional FB Audit translations
    connectFacebookPrompt: 'Facebookアカウントを接続して広告データを取得してください',
    facebookConnected: 'Facebookアカウントが接続されました',
    nextSelectAccount: '次のステップ：広告アカウント選択',
    selectAccountPrompt: '分析したい広告アカウントを選択してください：',
    noAccountsFound: '利用可能な広告アカウントが見つかりません',
    nextSelectPlan: '次のステップ：キャンペーンプラン選択',
    selectPlanPrompt: '予算プランを選択してください（過去に計算した予算計算結果から選択）：',
    noPlansFound: '利用可能なキャンペーンプランが見つかりません。まず予算計算機を使用してプランを作成してください。',
    nextSelectIndustry: '次のステップ：業界タイプ選択',
    selectIndustryPrompt: 'あなたのビジネスの業界タイプを選択してください：',
    runHealthCheck: 'ヘルスチェック実行',
    runStreamHealthCheck: 'ストリーミングヘルスチェック実行',
    fetchingData: 'Facebook広告データを取得中...',
    analyzingMetrics: '指標を分析中...',
    generatingRecommendations: 'AI推奨事項を生成中...',
    processingComplete: '処理完了',
    healthCheckRunning: 'ヘルスチェック実行中',
    currentProgress: '現在の進行状況',
    waitingResults: '結果をお待ちください...',
    runAgain: 'ヘルスチェックを再実行',
    backToDashboard: 'ダッシュボードに戻る',
    metric: '指標',
    target: '目標',
    actual: '実際',
    status: 'ステータス',
    recommendation: '推奨事項',
    loadingAccounts: '広告アカウントを読み込み中...',
    loadingPlans: 'プランを読み込み中...',
    pleaseSelect: '選択してください',
    createPlanFirst: 'まずプランを作成',
    
    // Security and analysis messages
    securityNotice: 'お客様の広告データの読み取りのみを行い、設定の変更は一切いたしません。データの安全性が最優先事項です。',
    analyzingYourData: 'お客様の広告データを分析中',
    analyzingDescription: '過去28日間の広告データを分析しておりますので、しばらくお待ちください...',
    resultsBasedOn: '過去28日間の広告データ分析に基づいて',
    tipTitle: '💡 ヒント',
    tipMessage: '広告クリエイティブのCTRが高いほど、通常CPCは低くなります。',
    
    // Additional UI messages
    loginRequired: 'まず広告健康診断機能をご利用するためにログインしてください',
    healthCheckFailed: 'ヘルスチェックに失敗しました。コンソールエラーメッセージを確認してください',
    confirmFbPermissions: 'FacebookアカウントがAdvertising管理権限を持っていることを確認してください',
    errorEncountered: '「この機能を使用できません」エラーが発生しましたか？',
    fbSetupGuide: '📋 Facebookアプリケーション設定ガイドを表示',
    nextSelectBudgetPlan: '次のステップ：予算プラン選択',
    nextSelectIndustryType: '次のステップ：業界タイプ選択',
    selectAdAccountStep: 'ステップ 2: 広告アカウント選択',
    selectPlanStep: 'ステップ 3: 予算プラン選択',
    selectIndustryStep: 'ステップ 4: 業界タイプ選択',
    
    // Pricing Page
    pricingTitle: '報數據プレミアム',
    pricingSubtitle: '広告投資を最大化する、プロレベルの分析ツール',
    whyChoose: 'なぜ報數據を選ぶのか？',
    whyChooseSubtitle: 'データ駆動型マーケティングの新しいスタンダード',
    simplePricing: 'シンプルな価格設定',
    simplePricingSubtitle: 'あなたのニーズに合わせて選べる2つのプラン',
    monthlyPlan: '月額プラン',
    lifetimePlan: 'ライフタイム',
    popularPlan: '人気プラン',
    bestValue: '最もお得',
    limitedSale: '限定セール中',
    getStarted: '今すぐ始める',
    buyNow: '今すぐ購入',
    planComparison: 'プラン比較',
    planComparisonSubtitle: '各プランの詳細な機能比較',
    features: '機能',
    monthlyCredits: '月間クレジット',
    priorityAccess: '新機能優先アクセス',
    creditDiscount: 'クレジット使用特別割引',
    dedicatedSupport: '専用サポート',
    basicSupport: '基本サポート',
    specialDiscount: '特別割引',
    getStartedToday: '今すぐ始めましょう',
    getStartedTodaySubtitle: '限定セール中、この機会をお見逃しなく',
    tryMonthly: '月額プランを試す',
    buyLifetime: 'ライフタイムを購入',
    
    // About Us Page
    about: {
      title: '私たちについて',
      subtitle: '広告運用者にデータ理解と戦略主導の能力を提供します。',
      mission: {
        title: 'なぜ《レポートデータ》を作ったのか？',
        problem: '多くの人はFacebook広告というと、広告管理画面を操作することだと思っています。しかし、私たちは本当に価値のある運用者は、ただボタンを押すだけでプロになれるわけではないことを知っています。',
        solution: '私たちが《レポートデータ》を作ったのは、より多くのマーケティング担当者が単なる「システム操作者」ではなく、独立して企画し、成果を分析し、最適化提案を行える広告戦略のエキスパートになれるよう支援したいからです。',
        platform: 'このプラットフォームは、GAデータからFacebook広告指標まで、私の十数年の実戦経験を統合し、各成果の背後にある意味を理解できるよう支援します。もう運任せの投資や、レポートを前に何も分からない状況はありません。',
        outcome: '予算の計画方法、ROASの追跡方法、上司に昇進を望まれ、クライアントに信頼される人材になる方法を学べます。'
      },
      founder: {
        title: '創設者紹介｜邱煜庭（小黒先生）',
        intro: 'どこかのクラスで私を見たことがあるか、投稿で私の言葉を読んだことがあるかもしれませんが、本当に自己紹介をするなら、こんな感じです：',
        experience: 'Facebook広告が世に出た時からこの業界に携わり、一人の小さな作業室から多国籍企業まで、1万円の予算から1000万円規模まで、ほぼすべての業界で経験を積んできました。この年月で、「聞ける人がいない」「どうしたらいいかわからない」という不安に陥る多くの優秀なマーケターを見てきました。',
        philosophy: 'よく冗談で、私は見つけにくいし、メッセージの返信も好きではないと言っています。だから、深夜一人でレポートと向き合う時に、もっと多くの「私の分身」があなたに寄り添えないかと考えました。',
        vision: '《レポートデータ》は、まさにそのような存在です。',
        conclusion: 'これは単なるツールではなく、あなたの背後にある論理的なサポートであり、突破口を見つけて提案を行う戦略コンサルタントです。'
      },
      company: {
        title: '私たちは誰ですか？',
        description: '《レポートデータ》は煜言顧問有限公司（台湾）と燈言顧問株式会社（日本）が共同開発・運営しています。この2つの会社は、私たちのオンラインコース「燒賣研究所」の法人実体および技術サポートでもあります。',
        mission: '私たちの核心任務はシンプルです——実戦経験を実践可能な戦略ツールに変え、より多くの広告運用者がさらに遠くへ行けるよう支援することです。',
        courses_intro: '現在、PressPlay Academyでの代表的なコースには以下があります：',
        course1: {
          title: 'EC構造学',
          description: 'ビジネスモデルとポジショニングから出発し、長期・短期の広告戦略フレームワークを構築'
        },
        course2: {
          title: 'FB広告自学攻略',
          description: '初心者向けにカスタマイズされた体系的な教育'
        },
        course3: {
          title: 'FB広告成果攻略',
          description: '上級運用者向けのデータ解釈と戦略提案トレーニング'
        },
        japan_office: '日本に設立した「燈言顧問」は、台湾ブランドの日本市場進出の架け橋となり、よりローカルなマーケティングアドバイスとコンサルティングリソースを提供したいと考えています。'
      },
      message: {
        title: 'あなたに伝えたいこと',
        growth: '広告で転職、昇進、フリーランス、さらには起業を目指しているなら、《レポートデータ》があなたの成長過程の各段階で最も信頼できるパートナーになることを願っています。',
        conclusion: 'これは管理画面操作の代替品ではなく、より賢明な決定を下すための副操縦士です。'
      },
      cta: {
        title: 'レポートデータを今すぐ使い始めましょう',
        description: 'あなたに最適なツールを選んで、広告最適化の旅を始めましょう',
        calculator: '広告予算計算機',
        fbaudit: 'FB広告ヘルスチェック',
        campaign_planner: 'キャンペーンプランナー'
      }
    }
  },
};

// Default locale
export const DEFAULT_LOCALE: Locale = 'zh-TW';

// Get translation for a specific locale
export const getTranslations = (locale: Locale): TranslationData => {
  return translations[locale] || translations[DEFAULT_LOCALE];
};

// Get available locales
export const getAvailableLocales = (): Locale[] => {
  return Object.keys(translations) as Locale[];
};

// Locale display names
export const getLocaleDisplayName = (locale: Locale): string => {
  const displayNames: Record<Locale, string> = {
    'zh-TW': '繁體中文',
    'en': 'English',
    'ja': '日本語',
  };
  return displayNames[locale];
};

// Browser locale detection
export const getBrowserLocale = (): Locale => {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;
  
  const browserLang = navigator.language || navigator.languages?.[0];
  
  if (browserLang?.startsWith('zh')) {
    return 'zh-TW';
  } else if (browserLang?.startsWith('ja')) {
    return 'ja';
  } else if (browserLang?.startsWith('en')) {
    return 'en';
  }
  
  return DEFAULT_LOCALE;
};

// Storage key for locale preference
export const LOCALE_STORAGE_KEY = 'reportdata-locale';