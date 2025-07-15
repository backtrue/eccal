import { useLocale } from "@/hooks/useLocale";
import Footer from "@/components/Footer";

export default function TermsOfServicePage() {
  const { locale } = useLocale();

  const t = {
    'zh-TW': {
      title: '服務條款',
      lastUpdated: '生效日：2025年7月15日',
      welcome: '歡迎使用報數據！',
      welcomeDesc: '當您開始使用報數據服務，即表示您信賴我們對您資訊的處理方式。我們深知這份責任重大，因此會盡力為您提供優質的電商廣告分析服務。',
      
      // 條款涵蓋範圍
      scopeOfTerms: '本條款涵蓋的範圍',
      scopeContent: '我們瞭解您可能會想略過本《服務條款》，但請務必詳閱，瞭解我們在您使用報數據服務時致力遵守的原則，以及我們期許您遵守的行為準則。',
      scopeDescription: '本《服務條款》反映出報數據的業務營運模式、本公司適用的法律，以及我們堅信的原則。因此，當您與我們的服務互動時，本《服務條款》有助於定義報數據與您的關係。例如，本條款包括下列主題：',
      
      ourPrinciples: '我們的服務原則，說明我們提供及開發服務的方式',
      yourConduct: '您的行為準則，說明使用報數據服務時須遵守的一些規則',
      serviceContentScope: '報數據服務中的內容，說明您在報數據服務中所接觸內容的智慧財產權歸屬',
      problemResolution: '發生問題或意見不合時，說明您擁有的其他合法權利，以及我們在有人違反本條款時採取的對應措施',
      
      agreement: '當您存取或使用我們的服務，即表示您同意本條款，因此請務必詳閱本條款內容。',
      privacyPolicy: '除了本條款外，我們還發布了《隱私權政策》。該政策並非本條款的一部分，但仍建議您詳閱，進一步瞭解如何更新、管理、匯出及刪除您的資訊。',
      
      // 服務供應商
      serviceProvider: '服務供應商',
      serviceProviderDesc: '報數據服務是由以下實體提供，該實體也是您的合約簽訂對象：',
      taiwanEntity: '煜言顧問有限公司',
      taiwanEntityDesc: '根據中華民國法律成立，並根據台灣法律營運的公司',
      japanEntity: '燈言顧問株式会社',
      japanEntityDesc: '根據日本法律成立，並根據日本法律營運的公司',
      
      // 年齡規定
      ageRequirements: '年齡規定',
      ageRequirementsDesc: '如果您未達自行管理帳戶的規定年齡，您必須取得家長或法定監護人同意，才能使用報數據帳戶。請與您的家長或法定監護人一起閱讀本條款。',
      parentConsent: '如果您是家長或法定監護人，且允許子女使用這些服務，您必須遵守本條款，並為子女在這些服務中的活動負責。',
      
      // 您與報數據的關係
      relationship: '您與報數據的關係',
      relationshipDesc: '本條款有助於界定您與報數據之間的關係。本條款中提及的「報數據」、「我們」和「我們的」是指煜言顧問有限公司、燈言顧問株式会社及其關聯企業。從廣義來說，我們會在您同意遵守本條款後，授權您存取及使用我們的服務。',
      
      // 我們的服務原則
      ourServicePrinciples: '我們的服務原則',
      providingServices: '提供廣泛多元的實用服務',
      providingServicesDesc: '我們提供的各種服務皆適用本條款，包括：',
      fbHealthCheck: 'Facebook 廣告健檢系統（AI 驅動的廣告帳戶健康檢查）',
      budgetCalculator: '廣告預算計算機（整合 Google Analytics 數據的預算規劃工具）',
      campaignPlanner: '活動預算規劃師（專業的五階段活動預算分配系統）',
      membershipSystem: '會員積分系統（點數管理和會員升級服務）',
      
      serviceIntegration: '我們的服務能夠互相搭配運作，方便您從一項活動接續執行下一項活動。舉例來說，您可以在廣告預算計算機中計算預算，然後在活動預算規劃師中制定詳細的執行計劃。',
      
      developingServices: '開發、改善及更新報數據服務',
      developingServicesDesc: '我們一直在開發新的技術和功能，以改進服務品質。舉例來說，我們利用人工智慧技術提供個人化的廣告建議，以及更有效地分析您的廣告成效。在持續改進服務品質的過程中，我們有時會新增或移除功能、提高或降低我們的服務限制，以及推出新服務或關閉舊服務。',
      
      serviceNotifications: '如果我們做出的重大變更會對您的服務使用行為造成負面影響，或是如果我們停止提供服務，我們會提前合理通知您，但如果有緊急狀況（例如防止濫用行為、配合法律要求或處理安全性問題），則不須提前通知。',
      
      serviceOverview: '服務概述',
      serviceContent: '服務內容',
      serviceContentDesc: '我們提供專業的電商廣告分析平台，包含：',
      service1: 'Facebook 廣告健檢系統 - AI 驅動的廣告帳戶健康檢查',
      service1Detail: '智能廣告優化建議、廣告成效分析報告',
      service2: '廣告預算計算機 - 整合 Google Analytics 數據',
      service2Detail: '精準預算規劃建議、多幣別支援系統',
      service3: '活動預算規劃師 - 五階段活動預算分配',
      service3Detail: '專業的預熱、啟動、主打、收尾、回購期規劃、智能預算優化演算法',
      serviceFeatures: '服務特色',
      aiDriven: 'AI 驅動：使用 OpenAI GPT-4 和 Google Gemini 提供智能分析',
      multiLanguage: '多語言支援：繁體中文、英文、日文三語系統',
      realTimeIntegration: '即時整合：與 Google Analytics 和 Facebook 廣告直接整合',
      userAccount: '使用者帳戶',
      accountRegistration: '帳戶註冊',
      loginMethod: '登入方式：支援 Google OAuth 登入',
      accountVerification: '帳戶驗證：透過 Google 身份驗證系統',
      accountResponsibility: '帳戶責任：用戶負責保護帳戶安全',
      accountUsage: '帳戶使用',
      personalUse: '個人使用：帳戶僅供個人使用，不得轉讓或共享',
      accurateInfo: '準確資訊：用戶應提供準確的個人資訊',
      timelyUpdate: '及時更新：如個人資訊變更，應及時更新',
      accountSuspension: '帳戶暫停或終止',
      accountSuspensionDesc: '我們保留在以下情況下暫停或終止帳戶的權利：',
      violateTerms: '違反服務條款',
      maliciousActivity: '進行惡意或非法活動',
      longTermInactive: '長期未使用帳戶',
      serviceUsageRules: '服務使用規範',
      legalUsage: '合法使用',
      legalUsageDesc: '用戶承諾：',
      followLaws: '遵守當地法律法規',
      noIllegalActivity: '不進行任何非法活動',
      noInfringe: '不侵犯他人權利',
      prohibitedBehavior: '禁止行為',
      prohibitedBehaviorDesc: '用戶不得：',
      noAttack: '攻擊或干擾系統運作',
      noSteal: '盜取他人帳戶或資料',
      noSpying: '進行商業間諜活動',
      noMalware: '散布惡意軟體或病毒',
      dataUsageResponsibility: '資料使用責任',
      legalAuth: '合法授權：確保您有權授權我們存取您的廣告數據',
      dataAccuracy: '資料準確性：對您提供的資料準確性負責',
      confidentialityObligation: '保密義務：保護透過服務獲得的商業資訊',
      membershipSystem: '會員制度',
      membershipLevels: '會員等級',
      freeMember: '免費會員：基本功能使用權限',
      proMember: '專業會員：完整功能和進階分析',
      pointsSystem: '點數系統',
      welcomePoints: '歡迎點數：新用戶獲得 30 點歡迎點數',
      referralRewards: '推薦獎勵：推薦朋友使用可獲得額外點數',
      featureUsage: '功能使用：部分功能需要消耗點數',
      membershipBenefits: '會員權益',
      freeMemberBenefits: '免費會員：廣告預算計算機、有限次數活動規劃',
      proMemberBenefits: '專業會員：無限制使用所有功能、優先客服支援',
      paidServices: '付費服務',
      pricingPlans: '付費方案',
      monthlyPlan: '月費方案：月付制專業會員',
      annualPlan: '年費方案：年付制專業會員（享有折扣優惠）',
      pointsPurchase: '點數購買：單次購買點數包',
      paymentMethods: '付款方式',
      paymentPlatform: '支付平台：使用 Stripe 安全付款系統',
      supportedCurrency: '支援貨幣：新台幣 (TWD)、美元 (USD)、日圓 (JPY)',
      paymentOptions: '付款方式：信用卡、銀行轉帳',
      refundPolicy: '退費政策',
      refundConditions: '退費條件：服務故障或重大功能異常',
      refundProcess: '退費流程：需提供詳細問題說明和使用記錄',
      refundTime: '退費時間：核准後 5-10 個工作日內退費',
      intellectualProperty: '智慧財產權',
      platformOwnership: '平台所有權',
      systemCopyright: '系統版權：平台系統和程式碼為我們所有',
      trademarkRights: '商標權：「報數據」商標為我們所有',
      designRights: '設計權：網站設計和使用者介面為我們所有',
      userData: '使用者資料',
      dataOwnership: '資料所有權：您的廣告數據和商業資訊歸您所有',
      usageLicense: '使用授權：您授權我們在提供服務範圍內使用您的資料',
      dataProtection: '資料保護：我們承諾保護您的商業機密',
      aiGeneratedContent: 'AI 生成內容',
      analysisReports: '分析報告：AI 生成的分析報告供您參考使用',
      recommendationContent: '建議內容：AI 建議僅供參考，不構成投資建議',
      intellectualPropertyAI: '智慧財產：AI 分析演算法和模型為我們所有',
      disclaimer: '免責聲明',
      serviceNature: '服務性質',
      analysisTool: '分析工具：本服務為分析工具，不提供投資建議',
      referenceNature: '參考性質：所有建議和分析僅供參考',
      decisionResponsibility: '決策責任：最終商業決策責任由用戶承擔',
      dataAccuracyDisclaimer: '資料準確性',
      bestEffort: '盡力而為：我們盡力確保資料準確，但不保證 100% 準確',
      thirdPartyData: '第三方資料：來自 Google、Facebook 的資料準確性由其負責',
      timeliness: '及時性：部分資料可能有延遲，實際以平台顯示為準',
      serviceAvailability: '服務可用性',
      serviceMaintenance: '服務維護：定期維護可能影響服務可用性',
      systemFailure: '系統故障：不可預見的系統故障可能中斷服務',
      thirdPartyDependency: '第三方依賴：依賴的第三方服務故障可能影響功能',
      liabilityLimitation: '責任限制',
      damageCompensationLimit: '損害賠償限制',
      damageCompensationLimitDesc: '我們的賠償責任限制為：',
      directLoss: '直接損失：不超過您過去 12 個月支付的費用',
      indirectLoss: '間接損失：不承擔任何間接、特殊或後果性損失',
      businessLoss: '商業損失：不承擔營業損失或利潤損失',
      forcemajeure: '不可抗力',
      forcemajeureDesc: '因以下原因造成的服務中斷，我們不承擔責任：',
      naturalDisaster: '天災、戰爭、恐怖攻擊',
      govRegulation: '政府法規變更',
      networkFailure: '網路或電力故障',
      thirdPartyServiceInterruption: '第三方服務中斷',
      privacyProtection: '隱私保護',
      privacyPolicyRef: '隱私政策',
      privacyPolicyRefDesc: '詳細規範：請參閱我們的隱私政策',
      dataProtectionCompliance: '資料保護：嚴格遵守資料保護法規',
      userDataControl: '用戶控制：您可控制個人資料的使用',
      facebookDataPolicy: 'Facebook 資料',
      facebookDataPolicyDesc: '授權使用：僅在您明確授權下存取 Facebook 資料',
      usageLimitation: '用途限制：僅用於提供廣告健檢服務',
      dataDeletion: '資料刪除：提供完整的資料刪除機制',
      dataSecurityPolicy: '資料安全',
      encryptedTransmission: '加密傳輸：所有資料傳輸使用 HTTPS 加密',
      accessControlPolicy: '存取控制：嚴格控制資料存取權限',
      securityMonitoring: '安全監控：24/7 安全監控系統',
      serviceChanges: '服務變更',
      featureUpdates: '功能更新',
      newFeatures: '新功能：我們可能新增新功能',
      featureAdjustments: '功能調整：可能調整或移除部分功能',
      advanceNotice: '提前通知：重大變更將提前通知用戶',
      termsModification: '條款修改',
      modificationRights: '修改權利：我們保留修改服務條款的權利',
      notificationObligation: '通知義務：重大修改將透過電子郵件或平台通知',
      effectiveTime: '生效時間：修改後的條款將於通知後 30 天生效',
      disputeResolution: '爭議解決',
      applicableLaw: '適用法律',
      jurisdictionLaw: '管轄法律：本條款受中華民國法律管轄',
      internationalUsers: '國際用戶：國際用戶也適用中華民國法律',
      disputeHandling: '爭議處理',
      negotiationResolution: '協商解決：首先透過友好協商解決爭議',
      mediationProcess: '調解程序：必要時透過第三方調解',
      courtJurisdiction: '法院管轄：最終由台灣台北地方法院管轄',
      contactInfo: '聯絡資訊',
      customerService: '客服聯絡',
      email: '電子郵件：backtrue@thinkwithblack.com',
      officialWebsite: '官方網站：https://thinkwithblack.com',
      serviceHours: '服務時間：週一至週五 9:00-18:00 (GMT+8)',
      companyInfo: '公司資訊',
      taiwanCompanyInfo: '台灣公司：煜言顧問有限公司',
      japanCompanyInfo: '日本公司：燈言顧問株式会社',
      founder: '創辦人：邱煜庭 (小黑老師)',
      otherTerms: '其他條款',
      completeAgreement: '完整協議',
      completeAgreementDesc: '本服務條款構成您與我們之間的完整協議。',
      severability: '可分割性',
      severabilityDesc: '如本條款任何部分被認定無效，其餘部分仍然有效。',
      effectiveDate: '生效日期',
      effectiveDateDesc: '本條款自 2025年7月15日 起生效。',
      thankYou: '感謝您使用報數據平台！'
    },
    'en': {
      title: 'Terms of Service',
      lastUpdated: 'Last Updated: July 15, 2025',
      welcome: 'Welcome to Report Data platform! These Terms of Service govern your rights and obligations when using our services.',
      serviceOverview: 'Service Overview',
      serviceProvider: 'Service Provider',
      serviceName: 'Service Name: Report Data',
      taiwanCompany: 'Taiwan Company: 煜言顧問有限公司',
      japanCompany: 'Japan Company: 燈言顧問株式会社',
      serviceUrl: 'Service URL: https://eccal.thinkwithblack.com',
      serviceContent: 'Service Content',
      serviceContentDesc: 'We provide a professional e-commerce advertising analytics platform, including:',
      service1: 'Facebook Ads Health Check System - AI-driven advertising account health check',
      service1Detail: 'Smart advertising optimization recommendations, advertising performance analysis reports',
      service2: 'Ad Budget Calculator - Integrated with Google Analytics data',
      service2Detail: 'Precise budget planning recommendations, multi-currency support system',
      service3: 'Campaign Budget Planner - Five-stage campaign budget allocation',
      service3Detail: 'Professional pre-heat, launch, main, final, repurchase period planning, intelligent budget optimization algorithms',
      serviceFeatures: 'Service Features',
      aiDriven: 'AI-Driven: Using OpenAI GPT-4 and Google Gemini for intelligent analysis',
      multiLanguage: 'Multi-language Support: Traditional Chinese, English, Japanese three-language system',
      realTimeIntegration: 'Real-time Integration: Direct integration with Google Analytics and Facebook Ads',
      userAccount: 'User Account',
      accountRegistration: 'Account Registration',
      loginMethod: 'Login Method: Support Google OAuth login',
      accountVerification: 'Account Verification: Through Google authentication system',
      accountResponsibility: 'Account Responsibility: Users are responsible for protecting account security',
      accountUsage: 'Account Usage',
      personalUse: 'Personal Use: Account is for personal use only, cannot be transferred or shared',
      accurateInfo: 'Accurate Information: Users should provide accurate personal information',
      timelyUpdate: 'Timely Update: If personal information changes, it should be updated promptly',
      accountSuspension: 'Account Suspension or Termination',
      accountSuspensionDesc: 'We reserve the right to suspend or terminate accounts in the following situations:',
      violateTerms: 'Violating terms of service',
      maliciousActivity: 'Engaging in malicious or illegal activities',
      longTermInactive: 'Long-term inactive accounts',
      serviceUsageRules: 'Service Usage Rules',
      legalUsage: 'Legal Usage',
      legalUsageDesc: 'Users commit to:',
      followLaws: 'Comply with local laws and regulations',
      noIllegalActivity: 'Not engage in any illegal activities',
      noInfringe: 'Not infringe on others\' rights',
      prohibitedBehavior: 'Prohibited Behavior',
      prohibitedBehaviorDesc: 'Users must not:',
      noAttack: 'Attack or interfere with system operation',
      noSteal: 'Steal others\' accounts or data',
      noSpying: 'Engage in commercial espionage',
      noMalware: 'Distribute malicious software or viruses',
      dataUsageResponsibility: 'Data Usage Responsibility',
      legalAuth: 'Legal Authorization: Ensure you have the right to authorize us to access your advertising data',
      dataAccuracy: 'Data Accuracy: Responsible for the accuracy of data you provide',
      confidentialityObligation: 'Confidentiality Obligation: Protect business information obtained through services',
      membershipSystem: 'Membership System',
      membershipLevels: 'Membership Levels',
      freeMember: 'Free Member: Basic function usage rights',
      proMember: 'Professional Member: Complete functions and advanced analysis',
      pointsSystem: 'Points System',
      welcomePoints: 'Welcome Points: New users receive 30 welcome points',
      referralRewards: 'Referral Rewards: Referring friends can earn additional points',
      featureUsage: 'Feature Usage: Some features require points consumption',
      membershipBenefits: 'Membership Benefits',
      freeMemberBenefits: 'Free Member: Ad budget calculator, limited campaign planning',
      proMemberBenefits: 'Professional Member: Unlimited access to all features, priority customer support',
      paidServices: 'Paid Services',
      pricingPlans: 'Pricing Plans',
      monthlyPlan: 'Monthly Plan: Monthly professional membership',
      annualPlan: 'Annual Plan: Annual professional membership (with discount)',
      pointsPurchase: 'Points Purchase: One-time points package purchase',
      paymentMethods: 'Payment Methods',
      paymentPlatform: 'Payment Platform: Using Stripe secure payment system',
      supportedCurrency: 'Supported Currency: Taiwan Dollar (TWD), US Dollar (USD), Japanese Yen (JPY)',
      paymentOptions: 'Payment Options: Credit card, bank transfer',
      refundPolicy: 'Refund Policy',
      refundConditions: 'Refund Conditions: Service failure or major functional abnormalities',
      refundProcess: 'Refund Process: Detailed problem description and usage records required',
      refundTime: 'Refund Time: 5-10 business days after approval',
      intellectualProperty: 'Intellectual Property Rights',
      platformOwnership: 'Platform Ownership',
      systemCopyright: 'System Copyright: Platform system and code are owned by us',
      trademarkRights: 'Trademark Rights: "Report Data" trademark is owned by us',
      designRights: 'Design Rights: Website design and user interface are owned by us',
      userData: 'User Data',
      dataOwnership: 'Data Ownership: Your advertising data and business information belong to you',
      usageLicense: 'Usage License: You authorize us to use your data within the scope of providing services',
      dataProtection: 'Data Protection: We commit to protecting your business secrets',
      aiGeneratedContent: 'AI Generated Content',
      analysisReports: 'Analysis Reports: AI-generated analysis reports for your reference',
      recommendationContent: 'Recommendation Content: AI recommendations are for reference only, not investment advice',
      intellectualPropertyAI: 'Intellectual Property: AI analysis algorithms and models are owned by us',
      disclaimer: 'Disclaimer',
      serviceNature: 'Service Nature',
      analysisTool: 'Analysis Tool: This service is an analysis tool, not providing investment advice',
      referenceNature: 'Reference Nature: All recommendations and analysis are for reference only',
      decisionResponsibility: 'Decision Responsibility: Final business decision responsibility lies with users',
      dataAccuracyDisclaimer: 'Data Accuracy',
      bestEffort: 'Best Effort: We strive to ensure data accuracy but do not guarantee 100% accuracy',
      thirdPartyData: 'Third-party Data: Data accuracy from Google, Facebook is their responsibility',
      timeliness: 'Timeliness: Some data may be delayed, actual platform display prevails',
      serviceAvailability: 'Service Availability',
      serviceMaintenance: 'Service Maintenance: Regular maintenance may affect service availability',
      systemFailure: 'System Failure: Unforeseen system failures may interrupt service',
      thirdPartyDependency: 'Third-party Dependency: Dependent third-party service failures may affect functionality',
      liabilityLimitation: 'Liability Limitation',
      damageCompensationLimit: 'Damage Compensation Limit',
      damageCompensationLimitDesc: 'Our compensation liability is limited to:',
      directLoss: 'Direct Loss: Not exceeding fees you paid in the past 12 months',
      indirectLoss: 'Indirect Loss: Not liable for any indirect, special, or consequential losses',
      businessLoss: 'Business Loss: Not liable for business losses or profit losses',
      forcemajeure: 'Force Majeure',
      forcemajeureDesc: 'We are not liable for service interruptions caused by:',
      naturalDisaster: 'Natural disasters, wars, terrorist attacks',
      govRegulation: 'Government regulation changes',
      networkFailure: 'Network or power failures',
      thirdPartyServiceInterruption: 'Third-party service interruptions',
      privacyProtection: 'Privacy Protection',
      privacyPolicyRef: 'Privacy Policy',
      privacyPolicyRefDesc: 'Detailed Regulations: Please refer to our privacy policy',
      dataProtectionCompliance: 'Data Protection: Strictly comply with data protection regulations',
      userDataControl: 'User Control: You can control the use of personal data',
      facebookDataPolicy: 'Facebook Data',
      facebookDataPolicyDesc: 'Authorized Use: Only access Facebook data with your explicit authorization',
      usageLimitation: 'Usage Limitation: Only used for providing advertising health check services',
      dataDeletion: 'Data Deletion: Provide complete data deletion mechanism',
      dataSecurityPolicy: 'Data Security',
      encryptedTransmission: 'Encrypted Transmission: All data transmission uses HTTPS encryption',
      accessControlPolicy: 'Access Control: Strictly control data access permissions',
      securityMonitoring: 'Security Monitoring: 24/7 security monitoring system',
      serviceChanges: 'Service Changes',
      featureUpdates: 'Feature Updates',
      newFeatures: 'New Features: We may add new features',
      featureAdjustments: 'Feature Adjustments: May adjust or remove some features',
      advanceNotice: 'Advance Notice: Major changes will be notified to users in advance',
      termsModification: 'Terms Modification',
      modificationRights: 'Modification Rights: We reserve the right to modify terms of service',
      notificationObligation: 'Notification Obligation: Major modifications will be notified via email or platform',
      effectiveTime: 'Effective Time: Modified terms will take effect 30 days after notification',
      disputeResolution: 'Dispute Resolution',
      applicableLaw: 'Applicable Law',
      jurisdictionLaw: 'Jurisdiction Law: These terms are governed by the laws of the Republic of China',
      internationalUsers: 'International Users: International users are also subject to the laws of the Republic of China',
      disputeHandling: 'Dispute Handling',
      negotiationResolution: 'Negotiation Resolution: First resolve disputes through friendly negotiation',
      mediationProcess: 'Mediation Process: Third-party mediation when necessary',
      courtJurisdiction: 'Court Jurisdiction: Finally governed by Taipei District Court, Taiwan',
      contactInfo: 'Contact Information',
      customerService: 'Customer Service Contact',
      email: 'Email: backtrue@thinkwithblack.com',
      officialWebsite: 'Official Website: https://thinkwithblack.com',
      serviceHours: 'Service Hours: Monday to Friday 9:00-18:00 (GMT+8)',
      companyInfo: 'Company Information',
      taiwanCompanyInfo: 'Taiwan Company: 煜言顧問有限公司',
      japanCompanyInfo: 'Japan Company: 燈言顧問株式会社',
      founder: 'Founder: 邱煜庭 (Mr. Kuro)',
      otherTerms: 'Other Terms',
      completeAgreement: 'Complete Agreement',
      completeAgreementDesc: 'These Terms of Service constitute the complete agreement between you and us.',
      severability: 'Severability',
      severabilityDesc: 'If any part of these terms is deemed invalid, the remaining parts remain valid.',
      effectiveDate: 'Effective Date',
      effectiveDateDesc: 'These terms are effective from July 15, 2025.',
      thankYou: 'Thank you for using Report Data platform!'
    },
    'ja': {
      title: 'サービス利用規約',
      lastUpdated: '最終更新日：2025年7月15日',
      welcome: 'Report Dataプラットフォームをご利用いただきありがとうございます！本サービス利用規約は、あなたが私たちのサービスを使用する際の権利と義務を規定しています。',
      serviceOverview: 'サービス概要',
      serviceProvider: 'サービス提供者',
      serviceName: 'サービス名：Report Data',
      taiwanCompany: '台湾会社：煜言顧問有限公司',
      japanCompany: '日本会社：燈言顧問株式会社',
      serviceUrl: 'サービスURL：https://eccal.thinkwithblack.com',
      serviceContent: 'サービス内容',
      serviceContentDesc: '私たちは専門的なeコマース広告分析プラットフォームを提供しており、以下を含みます：',
      service1: 'Facebook広告健康診断システム - AI駆動の広告アカウント健康チェック',
      service1Detail: 'スマート広告最適化提案、広告パフォーマンス分析レポート',
      service2: '広告予算計算機 - Google Analyticsデータと統合',
      service2Detail: '精密な予算計画提案、多通貨サポートシステム',
      service3: 'キャンペーン予算プランナー - 5段階キャンペーン予算配分',
      service3Detail: '専門的なプレヒート、ローンチ、メイン、ファイナル、リパーチェス期間計画、インテリジェント予算最適化アルゴリズム',
      serviceFeatures: 'サービス特徴',
      aiDriven: 'AI駆動：OpenAI GPT-4とGoogle Geminiを使用したインテリジェント分析',
      multiLanguage: '多言語サポート：繁体字中国語、英語、日本語の3言語システム',
      realTimeIntegration: 'リアルタイム統合：Google AnalyticsとFacebook広告との直接統合',
      userAccount: 'ユーザーアカウント',
      accountRegistration: 'アカウント登録',
      loginMethod: 'ログイン方法：Google OAuthログインをサポート',
      accountVerification: 'アカウント認証：Google認証システムを通じて',
      accountResponsibility: 'アカウント責任：ユーザーはアカウントのセキュリティを保護する責任があります',
      accountUsage: 'アカウント使用',
      personalUse: '個人使用：アカウントは個人使用のみで、譲渡や共有はできません',
      accurateInfo: '正確な情報：ユーザーは正確な個人情報を提供する必要があります',
      timelyUpdate: 'タイムリーな更新：個人情報が変更された場合は、タイムリーに更新する必要があります',
      accountSuspension: 'アカウント停止または終了',
      accountSuspensionDesc: '以下の状況でアカウントを停止または終了する権利を留保します：',
      violateTerms: 'サービス利用規約違反',
      maliciousActivity: '悪意のあるまたは違法な活動を行う',
      longTermInactive: '長期間未使用のアカウント',
      serviceUsageRules: 'サービス使用規範',
      legalUsage: '合法使用',
      legalUsageDesc: 'ユーザーは以下を約束します：',
      followLaws: '現地の法律法規を遵守する',
      noIllegalActivity: '違法な活動を行わない',
      noInfringe: '他者の権利を侵害しない',
      prohibitedBehavior: '禁止行為',
      prohibitedBehaviorDesc: 'ユーザーは以下を行ってはいけません：',
      noAttack: 'システムの運用を攻撃または干渉する',
      noSteal: '他人のアカウントやデータを盗む',
      noSpying: '商業スパイ活動を行う',
      noMalware: '悪意のあるソフトウェアやウイルスを拡散する',
      dataUsageResponsibility: 'データ使用責任',
      legalAuth: '合法的な承認：あなたの広告データへのアクセスを私たちに承認する権利があることを確認してください',
      dataAccuracy: 'データ精度：提供するデータの精度について責任を負います',
      confidentialityObligation: '機密保持義務：サービスを通じて得られる商業情報を保護する',
      membershipSystem: 'メンバーシップシステム',
      membershipLevels: 'メンバーシップレベル',
      freeMember: '無料メンバー：基本機能使用権限',
      proMember: 'プロフェッショナルメンバー：完全な機能と高度な分析',
      pointsSystem: 'ポイントシステム',
      welcomePoints: 'ウェルカムポイント：新規ユーザーは30ウェルカムポイントを獲得',
      referralRewards: '紹介報酬：友達を紹介すると追加ポイントを獲得できます',
      featureUsage: '機能使用：一部の機能はポイント消費が必要です',
      membershipBenefits: 'メンバーシップ特典',
      freeMemberBenefits: '無料メンバー：広告予算計算機、限定回数のキャンペーン計画',
      proMemberBenefits: 'プロフェッショナルメンバー：すべての機能への無制限アクセス、優先カスタマーサポート',
      paidServices: '有料サービス',
      pricingPlans: '料金プラン',
      monthlyPlan: '月額プラン：月払いプロフェッショナルメンバーシップ',
      annualPlan: '年間プラン：年払いプロフェッショナルメンバーシップ（割引あり）',
      pointsPurchase: 'ポイント購入：一回限りのポイントパッケージ購入',
      paymentMethods: '支払い方法',
      paymentPlatform: '支払いプラットフォーム：Stripe安全決済システムを使用',
      supportedCurrency: 'サポート通貨：台湾ドル（TWD）、米ドル（USD）、日本円（JPY）',
      paymentOptions: '支払いオプション：クレジットカード、銀行振込',
      refundPolicy: '返金ポリシー',
      refundConditions: '返金条件：サービス障害または重大な機能異常',
      refundProcess: '返金プロセス：詳細な問題説明と使用記録が必要',
      refundTime: '返金時間：承認後5-10営業日以内',
      intellectualProperty: '知的財産権',
      platformOwnership: 'プラットフォーム所有権',
      systemCopyright: 'システム著作権：プラットフォームシステムとコードは私たちが所有',
      trademarkRights: '商標権：「Report Data」商標は私たちが所有',
      designRights: 'デザイン権：ウェブサイトデザインとユーザーインターフェースは私たちが所有',
      userData: 'ユーザーデータ',
      dataOwnership: 'データ所有権：あなたの広告データと商業情報はあなたに属します',
      usageLicense: '使用ライセンス：サービス提供範囲内であなたのデータを使用することを承認していただきます',
      dataProtection: 'データ保護：あなたの商業秘密を保護することをお約束します',
      aiGeneratedContent: 'AI生成コンテンツ',
      analysisReports: '分析レポート：AI生成の分析レポートは参考用です',
      recommendationContent: '推奨コンテンツ：AI推奨は参考のみで、投資助言ではありません',
      intellectualPropertyAI: '知的財産：AI分析アルゴリズムとモデルは私たちが所有',
      disclaimer: '免責事項',
      serviceNature: 'サービスの性質',
      analysisTool: '分析ツール：このサービスは分析ツールであり、投資助言は提供していません',
      referenceNature: '参考性質：すべての推奨と分析は参考のみです',
      decisionResponsibility: '決定責任：最終的な商業決定責任はユーザーが負います',
      dataAccuracyDisclaimer: 'データ精度',
      bestEffort: '最善の努力：データの精度を確保するよう努めますが、100%の精度は保証しません',
      thirdPartyData: 'サードパーティデータ：Google、Facebookからのデータの精度は彼らの責任です',
      timeliness: 'タイムリー性：一部のデータは遅延する可能性があり、実際はプラットフォーム表示が優先されます',
      serviceAvailability: 'サービス可用性',
      serviceMaintenance: 'サービスメンテナンス：定期メンテナンスはサービス可用性に影響する可能性があります',
      systemFailure: 'システム障害：予期しないシステム障害はサービスを中断する可能性があります',
      thirdPartyDependency: 'サードパーティ依存：依存するサードパーティサービスの障害は機能に影響する可能性があります',
      liabilityLimitation: '責任制限',
      damageCompensationLimit: '損害補償制限',
      damageCompensationLimitDesc: '私たちの補償責任は以下に制限されます：',
      directLoss: '直接損失：過去12ヶ月間に支払った料金を超えない',
      indirectLoss: '間接損失：間接的、特別または結果的損失については責任を負いません',
      businessLoss: '営業損失：営業損失または利益損失については責任を負いません',
      forcemajeure: '不可抗力',
      forcemajeureDesc: '以下の理由によるサービス中断については責任を負いません：',
      naturalDisaster: '自然災害、戦争、テロ攻撃',
      govRegulation: '政府規制の変更',
      networkFailure: 'ネットワークまたは電力障害',
      thirdPartyServiceInterruption: 'サードパーティサービスの中断',
      privacyProtection: 'プライバシー保護',
      privacyPolicyRef: 'プライバシーポリシー',
      privacyPolicyRefDesc: '詳細規定：私たちのプライバシーポリシーを参照してください',
      dataProtectionCompliance: 'データ保護：データ保護規制を厳格に遵守',
      userDataControl: 'ユーザー制御：個人データの使用を制御できます',
      facebookDataPolicy: 'Facebookデータ',
      facebookDataPolicyDesc: '承認使用：あなたの明示的な承認の下でのみFacebookデータにアクセス',
      usageLimitation: '使用制限：広告健康診断サービスの提供のみに使用',
      dataDeletion: 'データ削除：完全なデータ削除メカニズムを提供',
      dataSecurityPolicy: 'データセキュリティ',
      encryptedTransmission: '暗号化伝送：すべてのデータ伝送はHTTPS暗号化を使用',
      accessControlPolicy: 'アクセス制御：データアクセス権限を厳格に制御',
      securityMonitoring: 'セキュリティ監視：24/7セキュリティ監視システム',
      serviceChanges: 'サービス変更',
      featureUpdates: '機能更新',
      newFeatures: '新機能：新しい機能を追加する可能性があります',
      featureAdjustments: '機能調整：一部の機能を調整または削除する可能性があります',
      advanceNotice: '事前通知：重要な変更はユーザーに事前通知します',
      termsModification: '規約修正',
      modificationRights: '修正権利：サービス利用規約を修正する権利を留保します',
      notificationObligation: '通知義務：重要な修正はメールまたはプラットフォーム通知で行います',
      effectiveTime: '効力発生時間：修正された規約は通知後30日で効力を発生します',
      disputeResolution: '紛争解決',
      applicableLaw: '適用法',
      jurisdictionLaw: '管轄法：本規約は中華民国の法律が適用されます',
      internationalUsers: '国際ユーザー：国際ユーザーも中華民国の法律が適用されます',
      disputeHandling: '紛争処理',
      negotiationResolution: '交渉解決：まず友好的な交渉により紛争を解決します',
      mediationProcess: '調停プロセス：必要に応じて第三者調停を行います',
      courtJurisdiction: '裁判管轄：最終的には台湾台北地方裁判所が管轄します',
      contactInfo: '連絡先情報',
      customerService: 'カスタマーサービス連絡先',
      email: 'メール：backtrue@thinkwithblack.com',
      officialWebsite: '公式ウェブサイト：https://thinkwithblack.com',
      serviceHours: 'サービス時間：月曜日から金曜日 9:00-18:00（GMT+8）',
      companyInfo: '会社情報',
      taiwanCompanyInfo: '台湾会社：煜言顧問有限公司',
      japanCompanyInfo: '日本会社：燈言顧問株式会社',
      founder: '創設者：邱煜庭（小黒先生）',
      otherTerms: 'その他の条項',
      completeAgreement: '完全な合意',
      completeAgreementDesc: 'このサービス利用規約は、あなたと私たちの間の完全な合意を構成します。',
      severability: '分離可能性',
      severabilityDesc: 'この規約のいずれかの部分が無効と認定された場合、残りの部分は有効のままです。',
      effectiveDate: '効力発生日',
      effectiveDateDesc: 'この規約は2025年7月15日から効力を発生します。',
      thankYou: 'Report Dataプラットフォームをご利用いただきありがとうございます！'
    }
  };

  const content = t[locale as keyof typeof t] || t['zh-TW'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {content.title}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
            {content.lastUpdated}
          </p>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {content.welcome}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              {content.serviceOverview}
            </h2>
            
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-3">
              {content.serviceProvider}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>{content.serviceName}</li>
              <li>{content.taiwanCompany}</li>
              <li>{content.japanCompany}</li>
              <li>{content.serviceUrl}</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-3">
              {content.serviceContent}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {content.serviceContentDesc}
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                <strong>{content.service1}</strong>
                <br />
                <span className="text-sm">{content.service1Detail}</span>
              </li>
              <li>
                <strong>{content.service2}</strong>
                <br />
                <span className="text-sm">{content.service2Detail}</span>
              </li>
              <li>
                <strong>{content.service3}</strong>
                <br />
                <span className="text-sm">{content.service3Detail}</span>
              </li>
            </ol>

            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-3">
              {content.serviceFeatures}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>{content.aiDriven}</li>
              <li>{content.multiLanguage}</li>
              <li>{content.realTimeIntegration}</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              {content.membershipSystem}
            </h2>
            
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-3">
              {content.membershipLevels}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>{content.freeMember}</li>
              <li>{content.proMember}</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-3">
              {content.pointsSystem}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>{content.welcomePoints}</li>
              <li>{content.referralRewards}</li>
              <li>{content.featureUsage}</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              {content.paidServices}
            </h2>
            
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-3">
              {content.pricingPlans}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>{content.monthlyPlan}</li>
              <li>{content.annualPlan}</li>
              <li>{content.pointsPurchase}</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-3">
              {content.paymentMethods}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>{content.paymentPlatform}</li>
              <li>{content.supportedCurrency}</li>
              <li>{content.paymentOptions}</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              {content.intellectualProperty}
            </h2>
            
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-3">
              {content.platformOwnership}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>{content.systemCopyright}</li>
              <li>{content.trademarkRights}</li>
              <li>{content.designRights}</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-3">
              {content.userData}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>{content.dataOwnership}</li>
              <li>{content.usageLicense}</li>
              <li>{content.dataProtection}</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              {content.disclaimer}
            </h2>
            
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-3">
              {content.serviceNature}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>{content.analysisTool}</li>
              <li>{content.referenceNature}</li>
              <li>{content.decisionResponsibility}</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              {content.contactInfo}
            </h2>
            
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-3">
              {content.customerService}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>{content.email}</li>
              <li>{content.officialWebsite}</li>
              <li>{content.serviceHours}</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-3">
              {content.companyInfo}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>{content.taiwanCompanyInfo}</li>
              <li>{content.japanCompanyInfo}</li>
              <li>{content.founder}</li>
            </ul>

            <hr className="my-8 border-gray-200 dark:border-gray-700" />
            <p className="text-center text-gray-600 dark:text-gray-400 font-medium">
              {content.effectiveDateDesc}
            </p>
            <p className="text-center text-gray-800 dark:text-gray-200 font-semibold mt-4">
              {content.thankYou}
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}