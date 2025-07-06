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
  tipTitle: string;
  tipMessage: string;
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
    tipTitle: '💡 ヒント',
    tipMessage: '広告クリエイティブのCTRが高いほど、通常CPCは低くなります。',
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