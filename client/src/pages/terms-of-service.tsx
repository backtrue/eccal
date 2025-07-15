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
      
      // 您的行為準則
      yourConductTitle: '您的行為準則',
      followTerms: '請遵守本條款',
      followTermsDesc: '我們允許您持續存取及使用報數據各項服務，惟您必須遵守：',
      theseTerms: '本條款',
      additionalTerms: '服務專屬附加條款，其中可能包括額外規定',
      
      resourcesHelp: '我們也會提供各項政策規範、說明中心文章及其他資源，協助解答常見問題及制定報數據服務使用準則。這些資源包括我們的《隱私權政策》、安全中心，以及其他可在我們網站上瀏覽的頁面。',
      
      intellectualProperty: '雖然我們授權您使用報數據各項服務，但我們在服務中擁有的智慧財產權仍為報數據所有。',
      
      respectOthers: '尊重他人',
      respectOthersDesc: '為了維護所有人互相尊重的環境，請務必恪守下列基本行為準則：',
      followLaws: '遵守適用法律，包括資料保護和商業法律',
      respectRights: '尊重他人的權利，包括隱私權和智慧財產權',
      noHarm: '切勿辱罵或傷害他人或自己（或是威脅或鼓吹他人從事這些行為），例如誤導、詐騙、非法冒用他人身分、誹謗、霸凌、騷擾或跟蹤他人',
      
      noAbuse: '請勿濫用報數據服務',
      noAbuseDesc: '存取或使用報數據服務的人，大多都瞭解維護安全開放的網路環境所須遵守的一般規則。不過，有少數人並未按規則行事，為了保護報數據服務和使用者不受濫用行為侵擾，在此說明這些一般規則。',
      
      prohibitedActivities: '您不得濫用、損害、干擾或影響我們的服務或系統，例如：',
      malware: '導入惡意軟體',
      spam: '濫發垃圾內容、進行入侵行為，或是規避我們的系統或防護措施',
      fraudulent: '以詐欺性或欺騙性方式存取或使用我們的服務/內容',
      phishing: '網路釣魚',
      fakeContent: '建立虛假的帳戶或內容',
      impersonation: '冒充他人身分',
      
      // 您的內容使用權限
      yourContent: '您的內容使用權限',
      contentOwnership: '您的內容仍屬於您所有',
      contentOwnershipDesc: '您的內容仍屬於您所有。換句話說，您仍保有自己內容的所有智慧財產權。舉例來說，您擁有您在活動預算規劃師中建立的計劃的智慧財產權。',
      
      licensingContent: '如果您的智慧財產權限制我們使用您的內容，我們會需要取得您的許可。您則透過本授權將相關權限授予報數據。',
      
      licenseScope: '本授權涵蓋的項目：只要您的內容受到智慧財產權保護，即在本授權涵蓋範圍內。',
      
      licenseRights: '本授權允許報數據執行下列動作：',
      hostContent: '管理、重製、散布、傳播及使用您的內容',
      processContent: '修改您的內容以及根據您的內容創作衍生作品，例如進行資料分析或產生建議',
      
      licensePurpose: '本授權僅適用於下列目的：',
      serviceOperation: '維持服務運作並提升服務品質',
      dataAnalysis: '使用您的資料進行廣告分析並提供個人化建議',
      serviceImprovement: '開發新的技術和服務',
      
      // 使用報數據服務
      usingServices: '使用報數據服務',
      yourAccount: '您的帳戶',
      yourAccountDesc: '為了方便起見，如果您符合年齡規定，可以透過 Google OAuth 建立報數據帳戶。您必須擁有帳戶才能使用某些服務。',
      accountSecurity: '您必須為自己的帳戶使用方式負責，包括採取合理步驟保護您的帳戶。',
      
      businessUse: '代表特定機構或商家使用報數據服務',
      businessUseDesc: '如要代表特定機構使用報數據服務，該機構的授權代表必須同意本條款。',
      
      serviceCommunications: '與服務相關的通訊內容',
      serviceCommunicationsDesc: '為了向您提供服務，我們有時會傳送服務公告和其他資訊給您。如果您選擇向報數據提供意見（例如改善服務的建議），我們可根據您的意見採取行動，但對您不負有任何義務。',
      
      // 報數據服務中的內容
      contentInServices: '報數據服務中的內容',
      yourContentInServices: '您的內容',
      yourContentInServicesDesc: '報數據的某些服務可讓您產生原創內容，例如建立預算計劃或儲存分析報告。我們不會主張擁有這類內容。',
      
      ourContent: '報數據提供的內容',
      ourContentDesc: '我們的某些服務含有隸屬於報數據的內容，例如 AI 分析報告範本或預設的計算公式。您可以在本條款的許可範圍內使用報數據的內容，但報數據保有這些內容的智慧財產權。',
      
      otherContent: '其他內容',
      otherContentDesc: '報數據的某些服務可讓您存取隸屬於其他使用者或第三方的內容。除非法律允許，否則您必須取得內容擁有者的許可，才能使用相關內容。',
      
      // 發生問題或意見不合時
      problemsAndDisputes: '發生問題或意見不合時',
      problemsAndDisputesDesc: '依據法律和本條款，您有權（1）享有特定服務品質，以及（2）在發生問題時取得修正問題的方法。',
      
      warranty: '擔保',
      warrantyDesc: '我們會以合理的技術和謹慎態度提供服務。如果我們提供的品質未達本擔保內容所述等級，您同意將這個情況告知我們，我們將與您一同解決這個問題。',
      
      disclaimer: '免責聲明',
      disclaimerDesc: '請勿使用報數據服務尋求專業的法律、財務或其他專業領域的建議。報數據服務針對這類主題提供的內容僅供參考，無法取代合格專業人士的建議。',
      
      liability: '法律責任',
      liabilityDesc: '本條款僅在適用法律許可範圍內限制報數據的責任。本條款並未限制以下各種情況的法律責任：詐欺或詐欺性不實陳述、因過失造成的死亡或人身傷害、重大過失、故意的不當行為。',
      
      // 在發生問題時採取行動
      takingAction: '在發生問題時採取行動',
      takingActionDesc: '採取下方所述的行動之前，我們將在合理可行的情況下提前通知您，向您說明我們採取相關行動的原因。',
      
      removingContent: '移除您的內容',
      removingContentDesc: '如果我們合理確信您的任何內容違反本條款、適用法律，或可能對其他使用者造成傷害，我們將保留移除部分或所有內容的權利。',
      
      suspendingAccess: '將您的服務存取權停權或終止',
      suspendingAccessDesc: '如果您嚴重或多次違反本條款、法律或法院命令規定，或我們合理確信您的行為對使用者造成傷害，報數據可暫停或終止您的服務存取權。',
      
      // 紛爭解決
      disputeResolution: '紛爭解決、準據法和法院',
      disputeResolutionDesc: '因本條款或相關服務所產生的任何爭議，將受台灣法律或日本法律規範（視服務提供地區而定）。',
      
      // 關於本條款
      aboutTerms: '關於本條款',
      aboutTermsDesc: '本條款說明了您與報數據之間的關係。我們希望讓這些條款內容更加淺顯易懂。',
      
      updatingTerms: '更新條款',
      updatingTermsDesc: '我們可能會基於以下原因更新本條款：（1）反映我們提供服務方式中的異動；（2）配合法律、法規或安全考量；或是（3）防止濫用情形。',
      
      notificationOfChanges: '如果我們更新本條款，我們會提前合理通知您，讓您有機會審視及接受重大變更。如果您不同意新條款內容，請停止使用相關服務。',
      
      // 聯絡方式
      contactInfo: '聯絡方式',
      contactInfoDesc: '如對本服務條款有任何疑問，請透過以下方式聯繫：',
      email: '電子郵件：backtrue@thinkwithblack.com',
      taiwanCompany: '台灣公司：煜言顧問有限公司',
      japanCompany: '日本公司：燈言顧問株式会社',
      website: '官方網站：https://thinkwithblack.com'
    },
    'en': {
      title: 'Terms of Service',
      lastUpdated: 'Effective Date: July 15, 2025',
      welcome: 'Welcome to Report Data!',
      welcomeDesc: 'When you start using Report Data services, you are trusting us with your information. We understand this is a big responsibility and work hard to provide you with quality e-commerce advertising analytics services.',
      
      // Scope of Terms
      scopeOfTerms: 'What these terms cover',
      scopeContent: 'We know it\'s tempting to skip these Terms of Service, but it\'s important to establish what you can expect from us as you use Report Data services, and what we expect from you.',
      scopeDescription: 'These Terms of Service reflect the way Report Data\'s business works, the laws that apply to our company, and certain things we\'ve always believed to be true. As a result, these Terms of Service help define Report Data\'s relationship with you as you interact with our services. For example, these terms include the following topics:',
      
      ourPrinciples: 'Our service principles, which outline how we provide and develop our services',
      yourConduct: 'Your conduct, which describes some rules for using Report Data services',
      serviceContentScope: 'Content in Report Data services, which describes the intellectual property rights to content you find in our services',
      problemResolution: 'In case of problems or disagreements, which describes other legal rights you have, and what to expect when we take action on violations of these terms',
      
      agreement: 'By accessing or using our services, you agree to these terms, so please read them carefully.',
      privacyPolicy: 'Apart from these terms, we also publish a Privacy Policy. Although it\'s not part of these terms, we encourage you to read it to better understand how you can update, manage, export, and delete your information.',
      
      // Service Provider
      serviceProvider: 'Service Provider',
      serviceProviderDesc: 'Report Data services are provided by, and you\'re contracting with:',
      taiwanEntity: '煜言顧問有限公司',
      taiwanEntityDesc: 'A company incorporated under the laws of Taiwan and operating under Taiwan law',
      japanEntity: '燈言顧問株式会社',
      japanEntityDesc: 'A company incorporated under the laws of Japan and operating under Japanese law',
      
      // Age Requirements
      ageRequirements: 'Age requirements',
      ageRequirementsDesc: 'If you\'re not old enough to manage your own Report Data account, you must have your parent or legal guardian\'s permission to use a Report Data account. Please have your parent or legal guardian read these terms with you.',
      parentConsent: 'If you\'re a parent or legal guardian, and you allow your child to use the services, then these terms apply to you and you\'re responsible for your child\'s activity on the services.',
      
      // Your Relationship with Report Data
      relationship: 'Your relationship with Report Data',
      relationshipDesc: 'These terms help define the relationship between you and Report Data. When we say "Report Data," "we," "us," and "our," we mean 煜言顧問有限公司, 燈言顧問株式会社, and their affiliates. Broadly speaking, we give you permission to access and use our services if you agree to follow these terms.',
      
      // Our Service Principles
      ourServicePrinciples: 'Our service principles',
      providingServices: 'Providing a broad range of useful services',
      providingServicesDesc: 'These terms apply to various services we offer, including:',
      fbHealthCheck: 'Facebook Ads Health Check System (AI-driven advertising account health check)',
      budgetCalculator: 'Ad Budget Calculator (budget planning tool integrated with Google Analytics data)',
      campaignPlanner: 'Campaign Budget Planner (professional five-stage campaign budget allocation system)',
      membershipSystem: 'Membership Points System (points management and membership upgrade services)',
      
      serviceIntegration: 'Our services are designed to work together, making it easier for you to move from one activity to the next. For example, you can calculate your budget in the Ad Budget Calculator and then create a detailed execution plan in the Campaign Budget Planner.',
      
      developingServices: 'Developing, improving, and updating Report Data services',
      developingServicesDesc: 'We\'re constantly developing new technologies and features to improve our services. For example, we use artificial intelligence to provide personalized advertising recommendations and more effectively analyze your ad performance. As part of this continual improvement, we sometimes add or remove features and functions, increase or decrease limits to our services, and start offering new services or stop offering old ones.',
      
      serviceNotifications: 'If we make changes that negatively impact your use of our services, or if we stop offering a service, we\'ll provide you with reasonable advance notice, except in urgent situations such as preventing abuse, responding to legal requirements, or addressing security issues.',
      
      // Your Conduct
      yourConductTitle: 'Your conduct',
      followTerms: 'Follow these terms',
      followTermsDesc: 'We give you permission to use our services if you agree to follow these terms, which include:',
      theseTerms: 'These Terms of Service',
      additionalTerms: 'Service-specific additional terms, which could include additional restrictions',
      
      resourcesHelp: 'We also provide various policies, help center articles, and other resources to answer common questions and set expectations for using our services. These resources include our Privacy Policy, Security Center, and other pages accessible from our websites.',
      
      intellectualProperty: 'Although we give you permission to use our services, we retain any intellectual property rights we have in the services.',
      
      respectOthers: 'Respect others',
      respectOthersDesc: 'We want to maintain a respectful environment for everyone, which means you must follow these basic rules of conduct:',
      followLaws: 'Comply with applicable laws, including data protection and business laws',
      respectRights: 'Respect the rights of others, including privacy and intellectual property rights',
      noHarm: 'Don\'t abuse or harm others or yourself (or threaten or encourage such abuse or harm) — for example, by misleading, defrauding, illegally impersonating, defaming, bullying, harassing, or stalking others',
      
      noAbuse: 'Don\'t abuse our services',
      noAbuseDesc: 'Most people who access or use our services understand the general rules that keep the internet safe and open. Unfortunately, a small number of people don\'t respect those rules, so we\'re describing them here to protect our services and users from abuse.',
      
      prohibitedActivities: 'Don\'t misuse, interfere with, or harm our services or systems, such as:',
      malware: 'Introducing malware',
      spam: 'Spamming, hacking, or bypassing our systems or protective measures',
      fraudulent: 'Accessing or using our services or content fraudulently or deceptively',
      phishing: 'Phishing',
      fakeContent: 'Creating false accounts or content',
      impersonation: 'Impersonating others',
      
      // Your Content Permissions
      yourContent: 'Your content permissions',
      contentOwnership: 'Your content remains yours',
      contentOwnershipDesc: 'Your content remains yours, which means that you retain any intellectual property rights that you have in your content. For example, you have intellectual property rights in the campaign plans you create in the Campaign Budget Planner.',
      
      licensingContent: 'If your intellectual property rights restrict our use of your content, we need your permission. You provide Report Data with that permission through this license.',
      
      licenseScope: 'What\'s covered: This license covers your content if that content is protected by intellectual property rights.',
      
      licenseRights: 'This license allows Report Data to:',
      hostContent: 'Host, reproduce, distribute, communicate, and use your content',
      processContent: 'Modify your content and create derivative works based on your content, such as performing data analysis or generating recommendations',
      
      licensePurpose: 'This license is for the limited purpose of:',
      serviceOperation: 'Operating and improving the services',
      dataAnalysis: 'Using your data for advertising analysis and providing personalized recommendations',
      serviceImprovement: 'Developing new technologies and services',
      
      // Using Report Data Services
      usingServices: 'Using Report Data services',
      yourAccount: 'Your account',
      yourAccountDesc: 'If you meet the age requirements, you can create a Report Data account via Google OAuth for your convenience. You need an account to use some services.',
      accountSecurity: 'You\'re responsible for what you do with your account, including taking reasonable steps to keep your account secure.',
      
      businessUse: 'Using Report Data services on behalf of an organization or business',
      businessUseDesc: 'If you\'re using our services on behalf of an organization, that organization must accept these terms.',
      
      serviceCommunications: 'Service-related communications',
      serviceCommunicationsDesc: 'To provide you with our services, we sometimes send you service announcements and other information. If you choose to give us feedback, such as suggestions to improve our services, we may act on your feedback without obligation to you.',
      
      // Content in Report Data Services
      contentInServices: 'Content in Report Data services',
      yourContentInServices: 'Your content',
      yourContentInServicesDesc: 'Some of our services give you the opportunity to make your original content available publicly. For example, you might create budget plans or save analysis reports. We don\'t claim ownership over that content.',
      
      ourContent: 'Report Data content',
      ourContentDesc: 'Some of our services include content that belongs to Report Data — for example, AI analysis report templates or default calculation formulas. You may use Report Data\'s content as allowed by these terms, but we retain any intellectual property rights that we have in our content.',
      
      otherContent: 'Other content',
      otherContentDesc: 'Some of our services give you access to content that belongs to other people or organizations. You may not use this content without that person or organization\'s permission, or in a way that is not allowed by law.',
      
      // In Case of Problems or Disagreements
      problemsAndDisputes: 'In case of problems or disagreements',
      problemsAndDisputesDesc: 'By law, you have the right to (1) a certain quality of service, and (2) ways to fix problems if things go wrong.',
      
      warranty: 'Warranty',
      warrantyDesc: 'We provide our services using reasonable skill and care. If we don\'t meet the quality level described in this warranty, you agree to tell us and we\'ll work with you to try to resolve the issue.',
      
      disclaimer: 'Disclaimers',
      disclaimerDesc: 'Don\'t rely on our services for professional legal, financial, or other advice. Any content related to such topics is provided for informational purposes only and is not a substitute for advice from qualified professionals.',
      
      liability: 'Liabilities',
      liabilityDesc: 'These terms only limit our responsibilities as allowed by applicable law. These terms don\'t limit liability for: fraud or fraudulent misrepresentation; death or personal injury caused by negligence; gross negligence; willful misconduct.',
      
      // Taking Action
      takingAction: 'Taking action in case of problems',
      takingActionDesc: 'Before taking action as described below, we\'ll provide you with advance notice when reasonably possible, explain the reason for our action, and give you an opportunity to clarify the issue or address the problem.',
      
      removingContent: 'Removing your content',
      removingContentDesc: 'If we reasonably believe that any of your content violates these terms, applicable law, or could harm our users, we may remove some or all of that content.',
      
      suspendingAccess: 'Suspending or terminating your access to Report Data services',
      suspendingAccessDesc: 'Report Data may suspend or stop providing our services to you if you repeatedly or egregiously violate these terms, are required to do so by law, or reasonably believe that your conduct causes harm to our users.',
      
      // Dispute Resolution
      disputeResolution: 'Dispute resolution, governing law, and courts',
      disputeResolutionDesc: 'For any dispute arising out of or relating to these terms or our services, the laws of Taiwan or Japan will apply (depending on the service region).',
      
      // About These Terms
      aboutTerms: 'About these terms',
      aboutTermsDesc: 'These terms describe the relationship between you and Report Data. We hope these terms are more understandable.',
      
      updatingTerms: 'Updating these terms',
      updatingTermsDesc: 'We may update these terms to (1) reflect changes in our services or how we do business, (2) comply with legal, regulatory, or security requirements, or (3) prevent abuse.',
      
      notificationOfChanges: 'If we update these terms, we\'ll provide you with reasonable advance notice and the opportunity to review and accept the changes. If you don\'t agree to the updated terms, please stop using our services.',
      
      // Contact Information
      contactInfo: 'Contact information',
      contactInfoDesc: 'If you have any questions about these terms, please contact us:',
      email: 'Email: backtrue@thinkwithblack.com',
      taiwanCompany: 'Taiwan Company: 煜言顧問有限公司',
      japanCompany: 'Japan Company: 燈言顧問株式会社',
      website: 'Official Website: https://thinkwithblack.com'
    },
    'ja': {
      title: 'サービス利用規約',
      lastUpdated: '施行日：2025年7月15日',
      welcome: 'Report Dataへようこそ！',
      welcomeDesc: 'Report Dataサービスのご利用を開始いただく際、お客様は私たちにお客様の情報を信頼してお預けいただいています。これは大きな責任であると認識し、質の高いeコマース広告分析サービスの提供に努めています。',
      
      // 規約の適用範囲
      scopeOfTerms: '本規約の適用範囲',
      scopeContent: '本サービス利用規約を読み飛ばしたくなる気持ちはわかりますが、Report Dataサービスをご利用いただく際に私たちがお客様に何を期待できるか、そして私たちがお客様に何を期待しているかを明確にすることが重要です。',
      scopeDescription: '本サービス利用規約は、Report Dataのビジネスの仕組み、当社に適用される法律、そして私たちが常に真実だと信じていることを反映しています。その結果、本サービス利用規約は、お客様が私たちのサービスと相互作用する際のReport Dataとお客様との関係を定義するのに役立ちます。例えば、これらの規約には以下のトピックが含まれています：',
      
      ourPrinciples: '私たちのサービス原則：私たちがサービスを提供し開発する方法を説明',
      yourConduct: 'お客様の行動：Report Dataサービスを使用する際のルールを説明',
      serviceContentScope: 'Report Dataサービスのコンテンツ：私たちのサービスで見つけるコンテンツの知的財産権を説明',
      problemResolution: '問題や意見の相違が発生した場合：お客様が持つその他の法的権利、および私たちがこれらの規約の違反に対して行動を起こす際の期待事項を説明',
      
      agreement: 'サービスにアクセスまたは使用することで、これらの規約に同意したことになりますので、注意深くお読みください。',
      privacyPolicy: 'これらの規約とは別に、プライバシーポリシーも公開しています。これらの規約の一部ではありませんが、お客様の情報を更新、管理、エクスポート、削除する方法をよりよく理解するために、お読みいただくことをお勧めします。',
      
      // サービス提供者
      serviceProvider: 'サービス提供者',
      serviceProviderDesc: 'Report Dataサービスは以下の事業体によって提供され、お客様との契約相手方となります：',
      taiwanEntity: '煜言顧問有限公司',
      taiwanEntityDesc: '台湾の法律に基づいて設立され、台湾法に基づいて運営されている会社',
      japanEntity: '燈言顧問株式会社',
      japanEntityDesc: '日本の法律に基づいて設立され、日本法に基づいて運営されている会社',
      
      // 年齢要件
      ageRequirements: '年齢要件',
      ageRequirementsDesc: '自分のReport Dataアカウントを管理するのに十分な年齢でない場合、Report Dataアカウントを使用するには、親または法定保護者の許可が必要です。親または法定保護者と一緒にこれらの規約をお読みください。',
      parentConsent: '親または法定保護者で、お子様にサービスの使用を許可している場合、これらの規約がお客様に適用され、サービスでのお子様の活動についてお客様が責任を負います。',
      
      // Report Dataとの関係
      relationship: 'Report Dataとの関係',
      relationshipDesc: 'これらの規約は、お客様とReport Dataとの関係を定義するのに役立ちます。「Report Data」、「私たち」、「当社」、「私たちの」と言う場合、煜言顧問有限公司、燈言顧問株式会社、およびその関連会社を意味します。広義には、お客様がこれらの規約に従うことに同意する場合、私たちはお客様に私たちのサービスへのアクセスと使用を許可します。',
      
      // 私たちのサービス原則
      ourServicePrinciples: '私たちのサービス原則',
      providingServices: '幅広い有用なサービスの提供',
      providingServicesDesc: 'これらの規約は、以下を含む私たちが提供するさまざまなサービスに適用されます：',
      fbHealthCheck: 'Facebook広告健康診断システム（AI駆動の広告アカウント健康チェック）',
      budgetCalculator: '広告予算計算機（Google Analyticsデータと統合された予算計画ツール）',
      campaignPlanner: 'キャンペーン予算プランナー（プロフェッショナルな5段階キャンペーン予算配分システム）',
      membershipSystem: 'メンバーシップポイントシステム（ポイント管理とメンバーシップアップグレードサービス）',
      
      serviceIntegration: '私たちのサービスは連携して動作するように設計されており、1つの活動から次の活動への移行をより簡単にします。例えば、広告予算計算機で予算を計算し、その後キャンペーン予算プランナーで詳細な実行計画を作成できます。',
      
      developingServices: 'Report Dataサービスの開発、改善、更新',
      developingServicesDesc: '私たちは常に新しい技術と機能を開発して、サービスを改善しています。例えば、人工知能を使用してパーソナライズされた広告推奨事項を提供し、広告パフォーマンスをより効果的に分析します。この継続的な改善の一環として、時々機能を追加または削除し、サービスの制限を増減し、新しいサービスの提供を開始したり、古いサービスの提供を停止したりします。',
      
      serviceNotifications: 'サービスの使用に悪影響を与える変更を行う場合、またはサービスの提供を停止する場合は、緊急事態（濫用の防止、法的要件への対応、セキュリティ問題への対処など）を除き、事前に合理的な通知を行います。',
      
      // お客様の行動
      yourConductTitle: 'お客様の行動',
      followTerms: 'これらの規約を遵守してください',
      followTermsDesc: 'これらの規約に従うことに同意していただければ、私たちのサービスを使用する許可をお客様に与えます。これらの規約には以下が含まれます：',
      theseTerms: '本サービス利用規約',
      additionalTerms: '追加の制限を含む可能性のあるサービス固有の追加規約',
      
      resourcesHelp: 'また、一般的な質問に答え、サービスの使用に関する期待を設定するために、さまざまなポリシー、ヘルプセンターの記事、その他のリソースを提供しています。これらのリソースには、プライバシーポリシー、セキュリティセンター、およびWebサイトからアクセス可能なその他のページが含まれます。',
      
      intellectualProperty: 'サービスの使用許可をお客様に与えていますが、サービスに関して私たちが持つ知的財産権は保持されます。',
      
      respectOthers: '他者を尊重する',
      respectOthersDesc: '全員にとって尊重される環境を維持したいため、以下の基本的な行動規則に従う必要があります：',
      followLaws: 'データ保護法および商法を含む適用法を遵守する',
      respectRights: 'プライバシー権と知的財産権を含む他者の権利を尊重する',
      noHarm: '他者または自分自身を辱めたり害したりしない（または、そのような辱めや害を脅迫または奨励しない）— 例えば、誤導、詐欺、違法ななりすまし、名誉毀損、いじめ、嫌がらせ、またはストーキングなど',
      
      noAbuse: 'サービスを濫用しない',
      noAbuseDesc: 'サービスにアクセスまたは使用するほとんどの人は、インターネットを安全で開かれた状態に保つ一般的なルールを理解しています。残念ながら、少数の人々はこれらのルールを尊重しないため、サービスとユーザーを濫用から保護するためにここでそれらを説明しています。',
      
      prohibitedActivities: '以下のような方法でサービスやシステムを悪用、妨害、または害してはいけません：',
      malware: 'マルウェアの導入',
      spam: 'スパム、ハッキング、または私たちのシステムや保護手段の回避',
      fraudulent: '詐欺的または欺瞞的な方法でのサービスやコンテンツへのアクセスまたは使用',
      phishing: 'フィッシング',
      fakeContent: '偽のアカウントやコンテンツの作成',
      impersonation: '他者になりすまし',
      
      // コンテンツの許可
      yourContent: 'お客様のコンテンツ許可',
      contentOwnership: 'お客様のコンテンツはお客様のものです',
      contentOwnershipDesc: 'お客様のコンテンツはお客様のものであり、お客様がコンテンツに対して持つ知的財産権を保持することを意味します。例えば、キャンペーン予算プランナーで作成したキャンペーン計画の知的財産権をお客様が持っています。',
      
      licensingContent: 'お客様の知的財産権が私たちのコンテンツ使用を制限する場合、お客様の許可が必要です。お客様はこのライセンスを通じてReport Dataにその許可を提供します。',
      
      licenseScope: '対象：このライセンスは、知的財産権によって保護されているお客様のコンテンツをカバーします。',
      
      licenseRights: 'このライセンスによりReport Dataは以下を行うことができます：',
      hostContent: 'お客様のコンテンツをホスト、複製、配布、伝達、使用する',
      processContent: 'データ分析の実行や推奨事項の生成など、お客様のコンテンツを修正し、お客様のコンテンツに基づいて派生作品を作成する',
      
      licensePurpose: 'このライセンスは以下の限定的な目的のためです：',
      serviceOperation: 'サービスの運営と改善',
      dataAnalysis: '広告分析とパーソナライズされた推奨事項の提供のためのお客様のデータの使用',
      serviceImprovement: '新しい技術とサービスの開発',
      
      // Report Dataサービスの使用
      usingServices: 'Report Dataサービスの使用',
      yourAccount: 'お客様のアカウント',
      yourAccountDesc: '年齢要件を満たしている場合、便宜上Google OAuthを介してReport Dataアカウントを作成できます。一部のサービスを使用するにはアカウントが必要です。',
      accountSecurity: 'アカウントのセキュリティを保護するための合理的な措置を講じることを含め、アカウントで行うことについて責任を負います。',
      
      businessUse: '組織またはビジネスの代理でのReport Dataサービスの使用',
      businessUseDesc: '組織の代理で私たちのサービスを使用している場合、その組織はこれらの規約を受け入れる必要があります。',
      
      serviceCommunications: 'サービス関連の連絡',
      serviceCommunicationsDesc: 'サービスを提供するために、時々サービスのお知らせやその他の情報をお送りします。サービスの改善提案などのフィードバックを選択していただいた場合、お客様への義務なしにそのフィードバックに基づいて行動することがあります。',
      
      // Report Dataサービスのコンテンツ
      contentInServices: 'Report Dataサービスのコンテンツ',
      yourContentInServices: 'お客様のコンテンツ',
      yourContentInServicesDesc: '私たちのサービスの一部では、お客様のオリジナルコンテンツを公開する機会を提供しています。例えば、予算計画を作成したり、分析レポートを保存したりできます。そのようなコンテンツの所有権を私たちは主張しません。',
      
      ourContent: 'Report Dataのコンテンツ',
      ourContentDesc: '私たちのサービスの一部には、Report Dataに属するコンテンツが含まれています — 例えば、AI分析レポートのテンプレートやデフォルトの計算式などです。これらの規約で許可されている範囲でReport Dataのコンテンツを使用できますが、私たちはコンテンツに対する知的財産権を保持します。',
      
      otherContent: 'その他のコンテンツ',
      otherContentDesc: '私たちのサービスの一部では、他の人や組織に属するコンテンツにアクセスできます。その人や組織の許可なしに、または法律で許可されていない方法でこのコンテンツを使用することはできません。',
      
      // 問題や意見の相違が発生した場合
      problemsAndDisputes: '問題や意見の相違が発生した場合',
      problemsAndDisputesDesc: '法律により、お客様には（1）一定の品質のサービスを受ける権利、および（2）問題が発生した場合の解決方法があります。',
      
      warranty: '保証',
      warrantyDesc: '私たちは合理的なスキルと注意を持ってサービスを提供します。この保証で説明されている品質レベルを満たしていない場合、お客様は私たちに知らせることに同意し、問題の解決に向けて一緒に取り組みます。',
      
      disclaimer: '免責事項',
      disclaimerDesc: '専門的な法的、財務的、またはその他の助言については、私たちのサービスに依存しないでください。そのようなトピックに関連するコンテンツは情報提供のみを目的として提供され、資格のある専門家からの助言に代わるものではありません。',
      
      liability: '責任',
      liabilityDesc: 'これらの規約は、適用法で許可されている範囲でのみ私たちの責任を制限します。これらの規約は以下について責任を制限しません：詐欺または詐欺的な虚偽表示；過失による死亡または人身傷害；重大な過失；故意の不正行為。',
      
      // 問題発生時の対応
      takingAction: '問題発生時の対応',
      takingActionDesc: '以下に説明する行動を取る前に、合理的に可能な場合は事前に通知を行い、行動の理由を説明し、問題を明確にしたり解決したりする機会を提供します。',
      
      removingContent: 'お客様のコンテンツの削除',
      removingContentDesc: 'お客様のコンテンツがこれらの規約、適用法に違反している、またはユーザーに害を与える可能性があると合理的に判断した場合、そのコンテンツの一部または全部を削除することがあります。',
      
      suspendingAccess: 'Report Dataサービスへのアクセスの停止または終了',
      suspendingAccessDesc: 'これらの規約に繰り返しまたは悪質に違反した場合、法律で要求された場合、またはお客様の行為がユーザーに害を与えると合理的に判断した場合、Report Dataはサービスの提供を停止または終了することがあります。',
      
      // 紛争解決
      disputeResolution: '紛争解決、準拠法、および裁判所',
      disputeResolutionDesc: 'これらの規約またはサービスから生じるまたはそれらに関連する紛争については、台湾法または日本法が適用されます（サービス地域によって異なります）。',
      
      // これらの規約について
      aboutTerms: 'これらの規約について',
      aboutTermsDesc: 'これらの規約は、お客様とReport Dataとの関係を説明しています。これらの規約がより理解しやすくなることを願っています。',
      
      updatingTerms: 'これらの規約の更新',
      updatingTermsDesc: '私たちは以下の理由でこれらの規約を更新することがあります：（1）サービスまたはビジネスの変更を反映するため、（2）法的、規制的、またはセキュリティ要件に準拠するため、または（3）濫用を防止するため。',
      
      notificationOfChanges: 'これらの規約を更新する場合、合理的な事前通知を行い、変更を確認し受け入れる機会を提供します。更新された規約に同意しない場合は、サービスの使用を停止してください。',
      
      // 連絡先情報
      contactInfo: '連絡先情報',
      contactInfoDesc: 'これらの規約についてご質問がございましたら、お気軽にお問い合わせください：',
      email: 'メール：backtrue@thinkwithblack.com',
      taiwanCompany: '台湾会社：煜言顧問有限公司',
      japanCompany: '日本会社：燈言顧問株式会社',
      website: '公式ウェブサイト：https://thinkwithblack.com'
    }
  };

  const currentText = t[locale as keyof typeof t] || t['zh-TW'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {currentText.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {currentText.lastUpdated}
            </p>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            {/* 歡迎 */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {currentText.welcome}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.welcomeDesc}
              </p>
            </div>

            {/* 條款涵蓋範圍 */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {currentText.scopeOfTerms}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.scopeContent}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.scopeDescription}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>{currentText.ourPrinciples}</li>
                <li>{currentText.yourConduct}</li>
                <li>{currentText.serviceContentScope}</li>
                <li>{currentText.problemResolution}</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.agreement}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.privacyPolicy}
              </p>
            </div>

            {/* 服務供應商 */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {currentText.serviceProvider}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.serviceProviderDesc}
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <strong>{currentText.taiwanEntity}</strong>
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {currentText.taiwanEntityDesc}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <strong>{currentText.japanEntity}</strong>
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {currentText.japanEntityDesc}
                </p>
              </div>
            </div>

            {/* 年齡規定 */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {currentText.ageRequirements}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.ageRequirementsDesc}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.parentConsent}
              </p>
            </div>

            {/* 您與報數據的關係 */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {currentText.relationship}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.relationshipDesc}
              </p>
            </div>

            {/* 我們的服務原則 */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {currentText.ourServicePrinciples}
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {currentText.providingServices}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.providingServicesDesc}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>{currentText.fbHealthCheck}</li>
                <li>{currentText.budgetCalculator}</li>
                <li>{currentText.campaignPlanner}</li>
                <li>{currentText.membershipSystem}</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.serviceIntegration}
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {currentText.developingServices}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.developingServicesDesc}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.serviceNotifications}
              </p>
            </div>

            {/* 您的行為準則 */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {currentText.yourConductTitle}
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {currentText.followTerms}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.followTermsDesc}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>{currentText.theseTerms}</li>
                <li>{currentText.additionalTerms}</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.resourcesHelp}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.intellectualProperty}
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {currentText.respectOthers}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.respectOthersDesc}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>{currentText.followLaws}</li>
                <li>{currentText.respectRights}</li>
                <li>{currentText.noHarm}</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {currentText.noAbuse}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.noAbuseDesc}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.prohibitedActivities}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>{currentText.malware}</li>
                <li>{currentText.spam}</li>
                <li>{currentText.fraudulent}</li>
                <li>{currentText.phishing}</li>
                <li>{currentText.fakeContent}</li>
                <li>{currentText.impersonation}</li>
              </ul>
            </div>

            {/* 您的內容使用權限 */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {currentText.yourContent}
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {currentText.contentOwnership}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.contentOwnershipDesc}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.licensingContent}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.licenseScope}
              </p>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.licenseRights}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>{currentText.hostContent}</li>
                <li>{currentText.processContent}</li>
              </ul>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.licensePurpose}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
                <li>{currentText.serviceOperation}</li>
                <li>{currentText.dataAnalysis}</li>
                <li>{currentText.serviceImprovement}</li>
              </ul>
            </div>

            {/* 使用報數據服務 */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {currentText.usingServices}
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {currentText.yourAccount}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.yourAccountDesc}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.accountSecurity}
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {currentText.businessUse}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.businessUseDesc}
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {currentText.serviceCommunications}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.serviceCommunicationsDesc}
              </p>
            </div>

            {/* 報數據服務中的內容 */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {currentText.contentInServices}
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {currentText.yourContentInServices}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.yourContentInServicesDesc}
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {currentText.ourContent}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.ourContentDesc}
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {currentText.otherContent}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.otherContentDesc}
              </p>
            </div>

            {/* 發生問題或意見不合時 */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {currentText.problemsAndDisputes}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.problemsAndDisputesDesc}
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {currentText.warranty}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.warrantyDesc}
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {currentText.disclaimer}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.disclaimerDesc}
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {currentText.liability}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.liabilityDesc}
              </p>
            </div>

            {/* 在發生問題時採取行動 */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {currentText.takingAction}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.takingActionDesc}
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {currentText.removingContent}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.removingContentDesc}
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {currentText.suspendingAccess}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.suspendingAccessDesc}
              </p>
            </div>

            {/* 紛爭解決 */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {currentText.disputeResolution}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.disputeResolutionDesc}
              </p>
            </div>

            {/* 關於本條款 */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {currentText.aboutTerms}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.aboutTermsDesc}
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {currentText.updatingTerms}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.updatingTermsDesc}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.notificationOfChanges}
              </p>
            </div>

            {/* 聯絡方式 */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {currentText.contactInfo}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {currentText.contactInfoDesc}
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  {currentText.email}
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  {currentText.taiwanCompany}
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  {currentText.japanCompany}
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  {currentText.website}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}