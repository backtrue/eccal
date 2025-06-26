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
}

const translations: Record<Locale, TranslationData> = {
  'zh-TW': {
    // Navigation
    home: '首頁',
    calculator: '預算計算機',
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
    
    // Footer
    blog: '部落格',
  },
  
  'en': {
    // Navigation
    home: 'Home',
    calculator: 'Budget Calculator',
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
    
    // Footer
    blog: 'Blog',
  },
  
  'ja': {
    // Navigation
    home: 'ホーム',
    calculator: '予算計算機',
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
    
    // Footer
    blog: 'ブログ',
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