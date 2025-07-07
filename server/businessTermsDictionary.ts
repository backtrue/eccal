// 日本語ビジネス用語辞典
// Japanese Business Terms Dictionary
// 基於用戶提供的日文商業用語文件建立的專業詞彙字典

export interface BusinessTerm {
  japanese: string;
  chinese: string;
  category: string;
  description?: string;
}

export const businessTermsDictionary: Record<string, BusinessTerm> = {
  // 財務指標 (Financial Indicators)
  'ROE': {
    japanese: 'ROE（アールオーイー）',
    chinese: '股東權益報酬率',
    category: '財務指標'
  },
  'ROA': {
    japanese: 'ROA（アールオーエー）',
    chinese: '資產報酬率',
    category: '財務指標'
  },
  'EPS': {
    japanese: 'EPS',
    chinese: '每股盈餘',
    category: '財務指標'
  },
  'PER': {
    japanese: 'PER',
    chinese: '股票的本益比/市盈率',
    category: '財務指標'
  },
  'PBR': {
    japanese: 'PBR',
    chinese: '股價淨值比',
    category: '財務指標'
  },
  'ROAS': {
    japanese: 'ROAS',
    chinese: '広告費用対効果',
    category: 'マーケティング'
  },

  // マーケティング用語 (Marketing Terms)
  'アーンドメディア': {
    japanese: 'アーンドメディア',
    chinese: '贏來的媒體/口碑',
    category: 'マーケティング'
  },
  'ペイドメディア': {
    japanese: 'ペイドメディア',
    chinese: '付費媒體',
    category: 'マーケティング'
  },
  'オウンドメディア': {
    japanese: 'オウンドメディア',
    chinese: '自有媒體',
    category: 'マーケティング'
  },
  'ターゲティング': {
    japanese: 'ターゲティング',
    chinese: '鎖定目標市場',
    category: 'マーケティング'
  },
  'ペルソナ': {
    japanese: 'ペルソナ',
    chinese: '人物誌（目標顧客的虛擬人物模型）',
    category: 'マーケティング'
  },
  'コンバージョン': {
    japanese: 'コンバージョン',
    chinese: '轉化/轉換',
    category: 'マーケティング'
  },
  'インプレッション': {
    japanese: 'インプレッション',
    chinese: '印象/感想/廣告顯示次數',
    category: 'マーケティング'
  },
  'CPC': {
    japanese: 'CPC',
    chinese: 'クリック単価',
    category: 'マーケティング'
  },
  'CTR': {
    japanese: 'CTR',
    chinese: 'クリック率',
    category: 'マーケティング'
  },
  'CPM': {
    japanese: 'CPM',
    chinese: '千回表示単価',
    category: 'マーケティング'
  },

  // ビジネス戦略 (Business Strategy)
  'KPI': {
    japanese: 'KPI',
    chinese: '重要業績評価指標',
    category: 'ビジネス戦略'
  },
  'KGI': {
    japanese: 'KGI',
    chinese: '重要目標達成指標',
    category: 'ビジネス戦略'
  },
  'PDCAサイクル': {
    japanese: 'PDCAサイクル',
    chinese: '計劃-執行-評估-改善的循環',
    category: 'ビジネス戦略'
  },
  'OODAループ': {
    japanese: 'OODAループ',
    chinese: '「觀察-定向-決定-實行」循環',
    category: 'ビジネス戦略'
  },
  'アジャイル': {
    japanese: 'アジャイル',
    chinese: '敏捷/快速',
    category: 'ビジネス戦略'
  },
  'ソリューション': {
    japanese: 'ソリューション',
    chinese: '解決方案',
    category: 'ビジネス戦略'
  },
  'コアコンピタンス': {
    japanese: 'コアコンピタンス',
    chinese: '核心競爭力',
    category: 'ビジネス戦略'
  },
  'シナジー': {
    japanese: 'シナジー',
    chinese: '協同作用/協同效果',
    category: 'ビジネス戦略'
  },

  // 投資・金融 (Investment & Finance)
  'インデックスファンド': {
    japanese: 'インデックスファンド',
    chinese: '指數型基金',
    category: '投資・金融'
  },
  'アクティブファンド': {
    japanese: 'アクティブファンド',
    chinese: '主動型基金',
    category: '投資・金融'
  },
  'ポートフォリオ': {
    japanese: 'ポートフォリオ',
    chinese: '投資組合',
    category: '投資・金融'
  },
  'リスクヘッジ': {
    japanese: 'リスクヘッジ',
    chinese: '風險對沖',
    category: '投資・金融'
  },
  'レバレッジ': {
    japanese: 'レバレッジ',
    chinese: '槓桿',
    category: '投資・金融'
  },
  'ボラティリティ': {
    japanese: 'ボラティリティ',
    chinese: '波動性/波動幅度',
    category: '投資・金融'
  },

  // IT・テクノロジー (IT & Technology)
  'ICT': {
    japanese: 'ICT（アイシーティー）',
    chinese: '資訊與通訊科技',
    category: 'IT・テクノロジー'
  },
  'DX': {
    japanese: 'DX',
    chinese: 'デジタルトランスフォーメーション',
    category: 'IT・テクノロジー'
  },
  'フィンテック': {
    japanese: 'フィンテック',
    chinese: '金融科技',
    category: 'IT・テクノロジー'
  },
  'クラウド': {
    japanese: 'クラウド',
    chinese: '雲端',
    category: 'IT・テクノロジー'
  },
  'AI': {
    japanese: 'AI',
    chinese: '人工知能',
    category: 'IT・テクノロジー'
  },
  'DeFi': {
    japanese: 'DeFi',
    chinese: '分散式金融',
    category: 'IT・テクノロジー'
  },

  // 人事・労務 (HR & Labor)
  'OJT': {
    japanese: 'OJT',
    chinese: '在職訓練/任職前的培訓',
    category: '人事・労務'
  },
  'メンター': {
    japanese: 'メンター',
    chinese: '導師/指導者',
    category: '人事・労務'
  },
  'ダイバーシティ': {
    japanese: 'ダイバーシティ',
    chinese: '多様性',
    category: '人事・労務'
  },
  'ワークライフバランス': {
    japanese: 'ワークライフバランス',
    chinese: '平衡工作和生活',
    category: '人事・労務'
  },
  'フレックスタイム': {
    japanese: 'フレックスタイム',
    chinese: '彈性工作時間（制度）',
    category: '人事・労務'
  },
  'コンプライアンス': {
    japanese: 'コンプライアンス',
    chinese: '法令遵守',
    category: '人事・労務'
  },

  // 会計・財務 (Accounting & Finance)
  '売上': {
    japanese: '売上',
    chinese: '營業額/銷售額',
    category: '会計・財務'
  },
  '粗利': {
    japanese: '粗利/売上総利益',
    chinese: '毛利',
    category: '会計・財務'
  },
  '純利益': {
    japanese: '純利益',
    chinese: '淨利',
    category: '会計・財務'
  },
  '経常利益': {
    japanese: '経常利益',
    chinese: '經常利益',
    category: '会計・財務'
  },
  '貸借対照表': {
    japanese: '貸借対照表',
    chinese: '資產負債表',
    category: '会計・財務'
  },
  '損益計算書': {
    japanese: '損益計算書',
    chinese: '損益表',
    category: '会計・財務'
  },
  'キャッシュフロー': {
    japanese: 'キャッシュフロー',
    chinese: '現金流',
    category: '会計・財務'
  },

  // 営業・販売 (Sales & Marketing)
  'クロージング': {
    japanese: 'クロージング',
    chinese: '簽約',
    category: '営業・販売'
  },
  'アプローチ': {
    japanese: 'アプローチ',
    chinese: '接近/靠近',
    category: '営業・販売'
  },
  'ヒアリング': {
    japanese: 'ヒアリング',
    chinese: '聽取（對方的）意見',
    category: '営業・販売'
  },
  'プレゼン': {
    japanese: 'プレゼン/プレゼンテーション',
    chinese: '發表/策劃方案說明',
    category: '営業・販売'
  },
  'ネゴシエーション': {
    japanese: 'ネゴシエーション',
    chinese: '交涉/談判',
    category: '営業・販売'
  },
  'インセンティブ': {
    japanese: 'インセンティブ',
    chinese: '刺激/誘因/獎勵',
    category: '営業・販売'
  }
};

// カテゴリー別の用語取得
export function getTermsByCategory(category: string): BusinessTerm[] {
  return Object.values(businessTermsDictionary).filter(term => term.category === category);
}

// 用語検索
export function searchTerms(query: string): BusinessTerm[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(businessTermsDictionary).filter(term => 
    term.japanese.toLowerCase().includes(lowerQuery) ||
    term.chinese.toLowerCase().includes(lowerQuery)
  );
}

// 日本語のマーケティング用語を正確に取得
export function getMarketingTerms(): BusinessTerm[] {
  return getTermsByCategory('マーケティング');
}

// 財務用語を正確に取得
export function getFinancialTerms(): BusinessTerm[] {
  return getTermsByCategory('財務指標');
}

// AI建議で使用する正確な日本語用語
export const aiAdviceTerms = {
  // 基本的な分析用語
  analysis: '分析',
  performance: 'パフォーマンス',
  improvement: '改善',
  optimization: '最適化',
  strategy: '戦略',
  tactics: '戦術',
  
  // 広告関連
  advertisement: '広告',
  campaign: 'キャンペーン',
  budget: '予算',
  targeting: 'ターゲティング',
  conversion: 'コンバージョン',
  impression: 'インプレッション',
  clickRate: 'クリック率',
  costPerClick: 'クリック単価',
  returnOnAdSpend: '広告費用対効果',
  
  // 推奨事項
  recommendation: '推奨事項',
  suggestion: '提案',
  advice: 'アドバイス',
  guidance: 'ガイダンス',
  
  // 目標設定
  target: '目標',
  goal: 'ゴール',
  objective: '目的',
  kpi: 'KPI（重要業績評価指標）',
  
  // 改善提案
  increase: '増加',
  decrease: '減少',
  maintain: '維持',
  adjust: '調整',
  enhance: '強化',
  reduce: '削減'
};

// AI建議生成時の専門用語確認
export function getCorrectJapaneseTerm(englishTerm: string): string {
  const term = businessTermsDictionary[englishTerm];
  if (term) {
    return term.japanese;
  }
  
  // fallback to aiAdviceTerms
  const aiTerm = aiAdviceTerms[englishTerm as keyof typeof aiAdviceTerms];
  return aiTerm || englishTerm;
}

// 広告健診レポート用の専門用語
export const fbAuditTerms = {
  healthCheck: '健康診断',
  diagnosis: '診断',
  analysis: '分析',
  metrics: '指標',
  performance: 'パフォーマンス',
  recommendation: '推奨事項',
  improvement: '改善案',
  optimization: '最適化',
  budget: '予算',
  spend: '支出',
  revenue: '収益',
  roas: 'ROAS（広告費用対効果）',
  ctr: 'CTR（クリック率）',
  cpc: 'CPC（クリック単価）',
  cpm: 'CPM（千回表示単価）',
  conversion: 'コンバージョン',
  conversionRate: 'コンバージョン率',
  impressions: 'インプレッション',
  clicks: 'クリック',
  reach: 'リーチ',
  frequency: '頻度',
  audience: 'オーディエンス',
  targeting: 'ターゲティング',
  creative: 'クリエイティブ',
  adAccount: '広告アカウント',
  campaign: 'キャンペーン',
  adSet: '広告セット',
  advertisement: '広告'
};