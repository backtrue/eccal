import { useLocale } from "@/hooks/useLocale";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
  const { locale } = useLocale();

  const t = {
    'zh-TW': {
      title: '隱私權政策',
      lastUpdated: '最後更新日期：2025年7月15日',
      welcome: '歡迎使用報數據 (Report Data) 平台！我們非常重視您的隱私權。本隱私權政策說明當您使用我們的服務時，我們如何收集、使用、儲存和保護您的資訊。',
      serviceOverview: '服務概述',
      serviceOverviewContent: '報數據是專業的電商廣告分析平台，提供以下三大核心服務：',
      service1: 'Facebook 廣告健檢系統 - AI 驅動的廣告帳戶健康檢查',
      service2: '廣告預算計算機 - 整合 Google Analytics 數據的預算規劃工具',
      service3: '活動預算規劃師 - 專業的五階段活動預算分配系統',
      dataCollection: '資訊收集類型',
      googleAuth: 'Google OAuth 登入資訊',
      googleAuthContent: '當您選擇 Google 登入時，我們會收集：',
      basicData: '基本資料：姓名、電子郵件地址、個人資料照片',
      gaPermissions: 'Google Analytics 權限：analytics.readonly 唯讀權限',
      purpose: '用途：用於身份驗證和 GA4 數據整合',
      facebookData: 'Facebook 廣告數據',
      facebookDataContent: '當您使用 Facebook 廣告健檢時，我們會收集：',
      facebookAccount: 'Facebook 廣告帳戶資訊：帳戶 ID、名稱、廣告數據',
      facebookPermissions: '請求權限：ads_read, ads_management',
      facebookPurpose: '用途：進行廣告健康檢查和 AI 分析',
      userInput: '使用者輸入資料',
      budgetParams: '預算計算參數：目標營收、平均客單價、轉換率',
      campaignData: '活動規劃資料：活動期間、預算分配偏好',
      savedPlans: '儲存的計劃：用戶自定義的預算計劃名稱和參數',
      autoCollection: '系統自動收集資訊',
      usageStats: '使用統計：功能使用次數、使用時間',
      techInfo: '技術資訊：IP 位址、瀏覽器類型、設備資訊',
      errorLogs: '錯誤日誌：用於改善服務品質',
      dataUsage: '資訊使用目的',
      coreServices: '提供核心服務',
      authentication: '身份驗證：確認您的身份和帳戶存取權',
      dataAnalysis: '數據分析：處理您的廣告數據並產生 AI 建議',
      budgetCalculation: '預算計算：根據您的參數計算最佳廣告預算',
      campaignPlanning: '活動規劃：提供專業的預算分配建議',
      serviceOptimization: '服務優化',
      performanceImprovement: '效能改善：分析服務使用情況以優化功能',
      errorFix: '錯誤修正：識別並解決技術問題',
      featureDevelopment: '功能開發：開發新功能以滿足用戶需求',
      customerService: '客戶服務',
      techSupport: '技術支援：協助解決使用問題',
      serviceNotifications: '服務通知：重要更新和維護通知',
      membershipManagement: '會員管理：管理您的會員等級和權限',
      facebookSpecial: 'Facebook 數據特別說明',
      facebookPermissionsUsage: 'Facebook 權限使用',
      adsRead: 'ads_read：讀取您的廣告帳戶數據，包括廣告活動、廣告組、廣告成效',
      adsManagement: 'ads_management：存取廣告帳戶管理資訊，用於深度分析和優化建議',
      facebookDataProcessing: 'Facebook 數據處理',
      dataAccess: '資料存取：僅在您明確授權後存取您的 Facebook 廣告數據',
      processingMethod: '處理方式：使用 OpenAI GPT-4 進行 AI 分析，產生個人化建議',
      dataRetention: '資料保存：廣告數據僅在分析期間暫時處理，不永久儲存',
      facebookPrivacyCommitment: 'Facebook 隱私承諾',
      readOnlyOps: '唯讀操作：我們只讀取您的廣告數據，絕不修改任何設定',
      dataSecurity: '資料安全：所有 Facebook 數據傳輸均使用 HTTPS 加密',
      userControl: '用戶控制：您可隨時撤銷 Facebook 授權',
      dataStorage: '資料儲存與安全',
      storageLocation: '資料儲存',
      database: '資料庫：使用 PostgreSQL 資料庫儲存用戶資料',
      cloudPlatform: '雲端平台：託管於 Replit 雲端平台',
      dataBackup: '資料備份：定期備份以確保資料安全',
      securityMeasures: '安全措施',
      encryptedTransmission: '加密傳輸：所有資料傳輸使用 HTTPS 加密',
      accessControl: '存取控制：僅授權人員可存取用戶資料',
      securityMonitoring: '安全監控：24/7 監控系統以防範安全威脅',
      dataRetentionPolicy: '資料保留',
      accountData: '帳戶資料：在您使用服務期間保留',
      usageRecords: '使用記錄：保留 12 個月用於服務改善',
      cachedData: '快取資料：GA4 和 Facebook 數據快取 24 小時後自動刪除',
      thirdPartyServices: '第三方服務',
      googleServices: 'Google 服務',
      googleOAuth: 'Google OAuth：用於身份驗證',
      gaApi: 'Google Analytics API：獲取 GA4 數據',
      gcp: 'Google Cloud Platform：部分技術基礎設施',
      facebookServices: 'Facebook 服務',
      facebookGraphApi: 'Facebook Graph API：存取廣告數據',
      facebookMarketingApi: 'Facebook Marketing API：獲取廣告成效資訊',
      aiServices: 'AI 服務',
      openaiGpt4: 'OpenAI GPT-4：提供 AI 分析和建議',
      googleGemini: 'Google Gemini：部分 AI 功能支援',
      otherServices: '其他服務',
      stripe: 'Stripe：處理付款（僅適用於付費功能）',
      brevo: 'Brevo：電子郵件通知服務',
      userRights: '用戶權利',
      dataAccessRights: '資料存取權',
      inquiryRight: '查詢權：查詢我們持有的您的個人資料',
      copyRight: '複製權：要求提供您的個人資料副本',
      dataControlRights: '資料控制權',
      correctionRight: '更正權：要求更正不正確的個人資料',
      deletionRight: '刪除權：要求刪除您的個人資料',
      restrictionRight: '限制處理權：要求限制特定資料的處理',
      withdrawalRight: '撤銷同意權',
      revokeAuth: '撤銷授權：可隨時撤銷 Google 或 Facebook 授權',
      stopService: '停止服務：可隨時停止使用我們的服務',
      facebookDataDeletion: 'Facebook 數據刪除',
      autoDeletion: '自動刪除',
      logoutDeletion: '登出時刪除：您登出時自動刪除所有 Facebook 資料',
      regularCleanup: '定期清理：系統每 24 小時自動清理過期資料',
      manualDeletion: '手動刪除',
      deletionEndpoint: '刪除端點：POST /api/facebook/data-deletion',
      confirmationMechanism: '確認機制：提供刪除確認回應',
      completeCleanup: '完整清理：刪除所有相關的 Facebook 資料',
      userControlFacebook: '用戶控制',
      facebookSettings: 'Facebook 設定：您可在 Facebook 應用程式設定中移除我們的應用程式',
      accountSettings: '帳戶設定：在我們的平台中解除 Facebook 連結',
      childrenPrivacy: '兒童隱私',
      childrenPrivacyContent: '本服務不針對 13 歲以下兒童設計，我們不會故意收集兒童的個人資訊。如發現兒童提供了個人資訊，我們會立即刪除。',
      internationalTransfer: '國際資料傳輸',
      internationalTransferContent: '您的資料可能在台灣、日本、美國等地區的伺服器上處理。我們確保所有資料傳輸符合當地的資料保護法規。',
      policyUpdates: '隱私政策更新',
      policyUpdatesContent: '我們可能會不時更新本隱私政策。重大變更將透過以下方式通知您：',
      emailNotification: '電子郵件通知',
      platformNotification: '平台內通知',
      officialWebsite: '官方網站公告',
      contactUs: '聯絡我們',
      contactUsContent: '如對本隱私政策有任何疑問，請透過以下方式聯繫：',
      email: '電子郵件：backtrue@thinkwithblack.com',
      taiwanCompany: '台灣公司：煜言顧問有限公司',
      japanCompany: '日本公司：燈言顧問株式会社',
      officialSite: '官方網站：https://thinkwithblack.com',
      legalJurisdiction: '本隱私政策受中華民國法律管轄。'
    },
    'en': {
      title: 'Privacy Policy',
      lastUpdated: 'Last Updated: July 15, 2025',
      welcome: 'Welcome to Report Data platform! We highly value your privacy. This privacy policy explains how we collect, use, store, and protect your information when you use our services.',
      serviceOverview: 'Service Overview',
      serviceOverviewContent: 'Report Data is a professional e-commerce advertising analytics platform that provides the following three core services:',
      service1: 'Facebook Ads Health Check System - AI-driven advertising account health check',
      service2: 'Ad Budget Calculator - Budget planning tool integrated with Google Analytics data',
      service3: 'Campaign Budget Planner - Professional five-stage campaign budget allocation system',
      dataCollection: 'Types of Information Collected',
      googleAuth: 'Google OAuth Login Information',
      googleAuthContent: 'When you choose Google login, we collect:',
      basicData: 'Basic Data: Name, email address, profile photo',
      gaPermissions: 'Google Analytics Permissions: analytics.readonly permission',
      purpose: 'Purpose: Used for authentication and GA4 data integration',
      facebookData: 'Facebook Advertising Data',
      facebookDataContent: 'When you use Facebook Ads Health Check, we collect:',
      facebookAccount: 'Facebook Ad Account Information: Account ID, name, advertising data',
      facebookPermissions: 'Requested Permissions: ads_read, ads_management',
      facebookPurpose: 'Purpose: Conduct advertising health checks and AI analysis',
      userInput: 'User Input Data',
      budgetParams: 'Budget Calculation Parameters: Target revenue, average order value, conversion rate',
      campaignData: 'Campaign Planning Data: Campaign period, budget allocation preferences',
      savedPlans: 'Saved Plans: User-defined budget plan names and parameters',
      autoCollection: 'System Auto-collected Information',
      usageStats: 'Usage Statistics: Feature usage frequency, usage time',
      techInfo: 'Technical Information: IP address, browser type, device information',
      errorLogs: 'Error Logs: Used to improve service quality',
      dataUsage: 'Information Usage Purpose',
      coreServices: 'Providing Core Services',
      authentication: 'Authentication: Confirm your identity and account access',
      dataAnalysis: 'Data Analysis: Process your advertising data and generate AI recommendations',
      budgetCalculation: 'Budget Calculation: Calculate optimal advertising budget based on your parameters',
      campaignPlanning: 'Campaign Planning: Provide professional budget allocation recommendations',
      serviceOptimization: 'Service Optimization',
      performanceImprovement: 'Performance Improvement: Analyze service usage to optimize features',
      errorFix: 'Error Correction: Identify and resolve technical issues',
      featureDevelopment: 'Feature Development: Develop new features to meet user needs',
      customerService: 'Customer Service',
      techSupport: 'Technical Support: Assist with usage issues',
      serviceNotifications: 'Service Notifications: Important updates and maintenance notices',
      membershipManagement: 'Membership Management: Manage your membership level and permissions',
      facebookSpecial: 'Facebook Data Special Notice',
      facebookPermissionsUsage: 'Facebook Permissions Usage',
      adsRead: 'ads_read: Read your ad account data, including ad campaigns, ad groups, ad performance',
      adsManagement: 'ads_management: Access ad account management information for in-depth analysis and optimization recommendations',
      facebookDataProcessing: 'Facebook Data Processing',
      dataAccess: 'Data Access: Only access your Facebook advertising data after explicit authorization',
      processingMethod: 'Processing Method: Use OpenAI GPT-4 for AI analysis to generate personalized recommendations',
      dataRetention: 'Data Retention: Advertising data is only temporarily processed during analysis, not permanently stored',
      facebookPrivacyCommitment: 'Facebook Privacy Commitment',
      readOnlyOps: 'Read-only Operations: We only read your advertising data, never modify any settings',
      dataSecurity: 'Data Security: All Facebook data transmission uses HTTPS encryption',
      userControl: 'User Control: You can revoke Facebook authorization at any time',
      dataStorage: 'Data Storage and Security',
      storageLocation: 'Data Storage',
      database: 'Database: Use PostgreSQL database to store user data',
      cloudPlatform: 'Cloud Platform: Hosted on Replit cloud platform',
      dataBackup: 'Data Backup: Regular backups to ensure data security',
      securityMeasures: 'Security Measures',
      encryptedTransmission: 'Encrypted Transmission: All data transmission uses HTTPS encryption',
      accessControl: 'Access Control: Only authorized personnel can access user data',
      securityMonitoring: 'Security Monitoring: 24/7 monitoring system to prevent security threats',
      dataRetentionPolicy: 'Data Retention',
      accountData: 'Account Data: Retained during your service usage period',
      usageRecords: 'Usage Records: Retained for 12 months for service improvement',
      cachedData: 'Cached Data: GA4 and Facebook data cache automatically deleted after 24 hours',
      thirdPartyServices: 'Third-party Services',
      googleServices: 'Google Services',
      googleOAuth: 'Google OAuth: Used for authentication',
      gaApi: 'Google Analytics API: Obtain GA4 data',
      gcp: 'Google Cloud Platform: Partial technical infrastructure',
      facebookServices: 'Facebook Services',
      facebookGraphApi: 'Facebook Graph API: Access advertising data',
      facebookMarketingApi: 'Facebook Marketing API: Obtain advertising performance information',
      aiServices: 'AI Services',
      openaiGpt4: 'OpenAI GPT-4: Provide AI analysis and recommendations',
      googleGemini: 'Google Gemini: Partial AI function support',
      otherServices: 'Other Services',
      stripe: 'Stripe: Process payments (only for paid features)',
      brevo: 'Brevo: Email notification service',
      userRights: 'User Rights',
      dataAccessRights: 'Data Access Rights',
      inquiryRight: 'Inquiry Right: Inquire about personal data we hold',
      copyRight: 'Copy Right: Request a copy of your personal data',
      dataControlRights: 'Data Control Rights',
      correctionRight: 'Correction Right: Request correction of incorrect personal data',
      deletionRight: 'Deletion Right: Request deletion of your personal data',
      restrictionRight: 'Restriction Right: Request restriction of specific data processing',
      withdrawalRight: 'Withdrawal of Consent Right',
      revokeAuth: 'Revoke Authorization: Can revoke Google or Facebook authorization at any time',
      stopService: 'Stop Service: Can stop using our services at any time',
      facebookDataDeletion: 'Facebook Data Deletion',
      autoDeletion: 'Automatic Deletion',
      logoutDeletion: 'Logout Deletion: Automatically delete all Facebook data when you log out',
      regularCleanup: 'Regular Cleanup: System automatically cleans expired data every 24 hours',
      manualDeletion: 'Manual Deletion',
      deletionEndpoint: 'Deletion Endpoint: POST /api/facebook/data-deletion',
      confirmationMechanism: 'Confirmation Mechanism: Provide deletion confirmation response',
      completeCleanup: 'Complete Cleanup: Delete all related Facebook data',
      userControlFacebook: 'User Control',
      facebookSettings: 'Facebook Settings: You can remove our app in Facebook app settings',
      accountSettings: 'Account Settings: Unlink Facebook account in our platform',
      childrenPrivacy: 'Children\'s Privacy',
      childrenPrivacyContent: 'This service is not designed for children under 13. We do not knowingly collect personal information from children. If we discover that a child has provided personal information, we will delete it immediately.',
      internationalTransfer: 'International Data Transfer',
      internationalTransferContent: 'Your data may be processed on servers in Taiwan, Japan, the United States, and other regions. We ensure all data transfers comply with local data protection regulations.',
      policyUpdates: 'Privacy Policy Updates',
      policyUpdatesContent: 'We may update this privacy policy from time to time. Major changes will be notified through the following methods:',
      emailNotification: 'Email notification',
      platformNotification: 'In-platform notification',
      officialWebsite: 'Official website announcement',
      contactUs: 'Contact Us',
      contactUsContent: 'If you have any questions about this privacy policy, please contact us through the following methods:',
      email: 'Email: backtrue@thinkwithblack.com',
      taiwanCompany: 'Taiwan Company: 煜言顧問有限公司',
      japanCompany: 'Japan Company: 燈言顧問株式会社',
      officialSite: 'Official Website: https://thinkwithblack.com',
      legalJurisdiction: 'This privacy policy is governed by the laws of the Republic of China (Taiwan).'
    },
    'ja': {
      title: 'プライバシーポリシー',
      lastUpdated: '最終更新日：2025年7月15日',
      welcome: 'Report Dataプラットフォームをご利用いただきありがとうございます！私たちはあなたのプライバシーを非常に重視しています。このプライバシーポリシーは、あなたが私たちのサービスを使用する際に、私たちがどのように情報を収集、使用、保存、保護するかを説明しています。',
      serviceOverview: 'サービス概要',
      serviceOverviewContent: 'Report Dataは、以下の3つの核となるサービスを提供する専門的なeコマース広告分析プラットフォームです：',
      service1: 'Facebook広告健康診断システム - AI駆動の広告アカウント健康チェック',
      service2: '広告予算計算機 - Google Analyticsデータと統合された予算計画ツール',
      service3: 'キャンペーン予算プランナー - 専門的な5段階キャンペーン予算配分システム',
      dataCollection: '収集する情報の種類',
      googleAuth: 'Google OAuthログイン情報',
      googleAuthContent: 'Googleログインを選択すると、以下を収集します：',
      basicData: '基本データ：名前、メールアドレス、プロフィール写真',
      gaPermissions: 'Google Analytics権限：analytics.readonly読み取り専用権限',
      purpose: '用途：認証とGA4データ統合に使用',
      facebookData: 'Facebook広告データ',
      facebookDataContent: 'Facebook広告健康診断を使用する際、以下を収集します：',
      facebookAccount: 'Facebook広告アカウント情報：アカウントID、名前、広告データ',
      facebookPermissions: '要求権限：ads_read、ads_management',
      facebookPurpose: '用途：広告健康チェックとAI分析の実施',
      userInput: 'ユーザー入力データ',
      budgetParams: '予算計算パラメータ：目標売上、平均注文額、コンバージョン率',
      campaignData: 'キャンペーン計画データ：キャンペーン期間、予算配分設定',
      savedPlans: '保存されたプラン：ユーザー定義の予算プラン名とパラメータ',
      autoCollection: 'システム自動収集情報',
      usageStats: '使用統計：機能使用頻度、使用時間',
      techInfo: '技術情報：IPアドレス、ブラウザタイプ、デバイス情報',
      errorLogs: 'エラーログ：サービス品質向上のために使用',
      dataUsage: '情報使用目的',
      coreServices: 'コアサービスの提供',
      authentication: '認証：あなたの身元とアカウントアクセスの確認',
      dataAnalysis: 'データ分析：広告データを処理してAI推奨を生成',
      budgetCalculation: '予算計算：パラメータに基づいて最適な広告予算を計算',
      campaignPlanning: 'キャンペーン計画：専門的な予算配分推奨を提供',
      serviceOptimization: 'サービス最適化',
      performanceImprovement: 'パフォーマンス向上：サービス使用状況を分析して機能を最適化',
      errorFix: 'エラー修正：技術的問題の特定と解決',
      featureDevelopment: '機能開発：ユーザーニーズを満たす新機能の開発',
      customerService: 'カスタマーサービス',
      techSupport: 'テクニカルサポート：使用問題の解決支援',
      serviceNotifications: 'サービス通知：重要な更新とメンテナンス通知',
      membershipManagement: 'メンバーシップ管理：メンバーシップレベルと権限の管理',
      facebookSpecial: 'Facebookデータ特別説明',
      facebookPermissionsUsage: 'Facebook権限使用',
      adsRead: 'ads_read：広告キャンペーン、広告グループ、広告パフォーマンスを含む広告アカウントデータの読み取り',
      adsManagement: 'ads_management：詳細な分析と最適化推奨のための広告アカウント管理情報へのアクセス',
      facebookDataProcessing: 'Facebookデータ処理',
      dataAccess: 'データアクセス：明示的な承認後のみFacebook広告データにアクセス',
      processingMethod: '処理方法：OpenAI GPT-4を使用してAI分析を行い、個人化された推奨を生成',
      dataRetention: 'データ保持：広告データは分析期間中のみ一時的に処理され、永続的に保存されません',
      facebookPrivacyCommitment: 'Facebookプライバシー約束',
      readOnlyOps: '読み取り専用操作：広告データを読み取るのみで、設定を変更することはありません',
      dataSecurity: 'データセキュリティ：すべてのFacebookデータ伝送はHTTPS暗号化を使用',
      userControl: 'ユーザー制御：いつでもFacebook承認を取り消すことができます',
      dataStorage: 'データ保存とセキュリティ',
      storageLocation: 'データ保存',
      database: 'データベース：ユーザーデータの保存にPostgreSQLデータベースを使用',
      cloudPlatform: 'クラウドプラットフォーム：Replitクラウドプラットフォームでホスト',
      dataBackup: 'データバックアップ：データセキュリティを確保するための定期バックアップ',
      securityMeasures: 'セキュリティ対策',
      encryptedTransmission: '暗号化伝送：すべてのデータ伝送はHTTPS暗号化を使用',
      accessControl: 'アクセス制御：承認された人員のみがユーザーデータにアクセス可能',
      securityMonitoring: 'セキュリティ監視：セキュリティ脅威を防ぐ24/7監視システム',
      dataRetentionPolicy: 'データ保持',
      accountData: 'アカウントデータ：サービス使用期間中に保持',
      usageRecords: '使用記録：サービス改善のために12ヶ月間保持',
      cachedData: 'キャッシュデータ：GA4とFacebookデータキャッシュは24時間後に自動削除',
      thirdPartyServices: 'サードパーティサービス',
      googleServices: 'Googleサービス',
      googleOAuth: 'Google OAuth：認証に使用',
      gaApi: 'Google Analytics API：GA4データの取得',
      gcp: 'Google Cloud Platform：部分的な技術インフラ',
      facebookServices: 'Facebookサービス',
      facebookGraphApi: 'Facebook Graph API：広告データへのアクセス',
      facebookMarketingApi: 'Facebook Marketing API：広告パフォーマンス情報の取得',
      aiServices: 'AIサービス',
      openaiGpt4: 'OpenAI GPT-4：AI分析と推奨の提供',
      googleGemini: 'Google Gemini：部分的なAI機能サポート',
      otherServices: 'その他のサービス',
      stripe: 'Stripe：支払い処理（有料機能のみ）',
      brevo: 'Brevo：メール通知サービス',
      userRights: 'ユーザーの権利',
      dataAccessRights: 'データアクセス権',
      inquiryRight: '照会権：私たちが保有するあなたの個人データについての照会',
      copyRight: '複製権：あなたの個人データのコピーを要求',
      dataControlRights: 'データ制御権',
      correctionRight: '訂正権：不正確な個人データの訂正を要求',
      deletionRight: '削除権：あなたの個人データの削除を要求',
      restrictionRight: '制限権：特定のデータ処理の制限を要求',
      withdrawalRight: '同意撤回権',
      revokeAuth: '承認取り消し：いつでもGoogleまたはFacebook承認を取り消し可能',
      stopService: 'サービス停止：いつでも私たちのサービスの使用を停止可能',
      facebookDataDeletion: 'Facebookデータ削除',
      autoDeletion: '自動削除',
      logoutDeletion: 'ログアウト削除：ログアウト時にすべてのFacebookデータを自動削除',
      regularCleanup: '定期クリーンアップ：システムが24時間ごとに期限切れデータを自動クリーンアップ',
      manualDeletion: '手動削除',
      deletionEndpoint: '削除エンドポイント：POST /api/facebook/data-deletion',
      confirmationMechanism: '確認メカニズム：削除確認応答を提供',
      completeCleanup: '完全クリーンアップ：関連するすべてのFacebookデータを削除',
      userControlFacebook: 'ユーザー制御',
      facebookSettings: 'Facebook設定：Facebookアプリ設定で私たちのアプリを削除可能',
      accountSettings: 'アカウント設定：私たちのプラットフォームでFacebookアカウントのリンクを解除',
      childrenPrivacy: '子供のプライバシー',
      childrenPrivacyContent: 'このサービスは13歳未満の子供を対象としていません。私たちは故意に子供の個人情報を収集することはありません。子供が個人情報を提供したことが判明した場合、直ちに削除します。',
      internationalTransfer: '国際データ転送',
      internationalTransferContent: 'あなたのデータは台湾、日本、米国などの地域のサーバーで処理される可能性があります。すべてのデータ転送が現地のデータ保護規制に準拠することを確保します。',
      policyUpdates: 'プライバシーポリシーの更新',
      policyUpdatesContent: '私たちは随時このプライバシーポリシーを更新する可能性があります。重要な変更は以下の方法で通知します：',
      emailNotification: 'メール通知',
      platformNotification: 'プラットフォーム内通知',
      officialWebsite: '公式ウェブサイト告知',
      contactUs: 'お問い合わせ',
      contactUsContent: 'このプライバシーポリシーについてご質問がある場合は、以下の方法でお問い合わせください：',
      email: 'メール：backtrue@thinkwithblack.com',
      taiwanCompany: '台湾会社：煜言顧問有限公司',
      japanCompany: '日本会社：燈言顧問株式会社',
      officialSite: '公式ウェブサイト：https://thinkwithblack.com',
      legalJurisdiction: 'このプライバシーポリシーは中華民国（台湾）の法律に準拠します。'
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
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {content.serviceOverviewContent}
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>{content.service1}</li>
              <li>{content.service2}</li>
              <li>{content.service3}</li>
            </ol>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              {content.dataCollection}
            </h2>
            
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-3">
              {content.googleAuth}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              {content.googleAuthContent}
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>{content.basicData}</li>
              <li>{content.gaPermissions}</li>
              <li>{content.purpose}</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-3">
              {content.facebookData}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              {content.facebookDataContent}
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>{content.facebookAccount}</li>
              <li>{content.facebookPermissions}</li>
              <li>{content.facebookPurpose}</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-3">
              {content.userInput}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>{content.budgetParams}</li>
              <li>{content.campaignData}</li>
              <li>{content.savedPlans}</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-3">
              {content.autoCollection}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>{content.usageStats}</li>
              <li>{content.techInfo}</li>
              <li>{content.errorLogs}</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              {content.facebookSpecial}
            </h2>
            
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-3">
              {content.facebookPermissionsUsage}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>{content.adsRead}</li>
              <li>{content.adsManagement}</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-3">
              {content.facebookDataProcessing}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>{content.dataAccess}</li>
              <li>{content.processingMethod}</li>
              <li>{content.dataRetention}</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-3">
              {content.facebookPrivacyCommitment}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>{content.readOnlyOps}</li>
              <li>{content.dataSecurity}</li>
              <li>{content.userControl}</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              {content.facebookDataDeletion}
            </h2>
            
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-3">
              {content.autoDeletion}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>{content.logoutDeletion}</li>
              <li>{content.regularCleanup}</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-3">
              {content.manualDeletion}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>{content.deletionEndpoint}</li>
              <li>{content.confirmationMechanism}</li>
              <li>{content.completeCleanup}</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              {content.userRights}
            </h2>
            
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-3">
              {content.dataAccessRights}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>{content.inquiryRight}</li>
              <li>{content.copyRight}</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-3">
              {content.dataControlRights}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>{content.correctionRight}</li>
              <li>{content.deletionRight}</li>
              <li>{content.restrictionRight}</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">
              {content.contactUs}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {content.contactUsContent}
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>{content.email}</li>
              <li>{content.taiwanCompany}</li>
              <li>{content.japanCompany}</li>
              <li>{content.officialSite}</li>
            </ul>

            <hr className="my-8 border-gray-200 dark:border-gray-700" />
            <p className="text-center text-gray-600 dark:text-gray-400 font-medium">
              {content.legalJurisdiction}
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}