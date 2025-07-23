import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Target, 
  TrendingUp, 
  BarChart3, 
  Zap, 
  Gift, 
  Star,
  Clock,
  Users,
  Award,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react';

interface RecruitmentProps {
  locale?: string;
}

export default function Recruitment({ locale = 'zh-TW' }: RecruitmentProps) {
  const painPoints = [
    "營收目標很明確，但完全不知道該配多少「廣告預算」才合理？",
    "廣告投了一段時間，錢花出去了，卻不知道成效是好是壞？", 
    "聽說要看數據，但 GA4 和 FB 後台的數字這麼多，到底哪些才是關鍵？",
    "想學 AI，但市面上的課都只教「通用技巧」，無法直接解決我「廣告投放」的具體問題。",
    "買了線上課程，但總是懶得看、遇到問題也沒人問，最後不了了之…"
  ];

  const targetAudience = [
    {
      title: "電商品牌主/行銷人員",
      description: "希望能精準掌握廣告預算，提升每一分錢的效益。"
    },
    {
      title: "廣告投手/代理商", 
      description: "希望能用數據說服客戶，並提供更專業的優化建議。"
    },
    {
      title: "內容創作者/KOL",
      description: "希望能看懂自己的流量與廣告成效，做出更明智的商業決策。"
    },
    {
      title: "數據驅動行銷愛好者",
      description: "想擺脫猜測、用科學方法做決策的人。"
    }
  ];

  const notSuitableFor = [
    "還未開始投放任何廣告，對基本概念一無所知的人。",
    "只想尋找「一鍵致富」神奇按鈕，不願意動手操作、學習看數據的人。",
    "對投資自己的專業能力與事業猶豫不決的人。"
  ];

  const faqs = [
    {
      question: "我是電腦麻瓜，會不會很難？",
      answer: "完全不用擔心！這次直播的主要目的，就是由我親手帶你完成所有設定。只要你會用滑鼠和鍵盤，就能跟上。"
    },
    {
      question: "直播如果沒跟上，可以看重播嗎？",
      answer: "可以！所有創始會員都能無限次回看這次的直播錄影。"
    },
    {
      question: "「終身使用權」是真的嗎？",
      answer: "是的，這是我對 300 位創始會員的承諾。未來平台對外皆為年費訂閱制，只有創始會員能享有此資格。"
    },
    {
      question: "購買後如何上課與使用軟體？",
      answer: "購買成功後，您會收到一封確認信，內含直播課程連結、軟體註冊方式、以及線上課程的兌換資訊。"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* 頂部導覽 */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <div className="text-2xl font-bold text-blue-600">報數據</div>
            </Link>
            <Link href="/pricing">
              <Button variant="ghost" size="sm">
                返回平台
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 第一部分：鉤子 - The Hook */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="mb-8">
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-4 py-2 text-lg font-medium mb-6">
              🔥 限時招生中
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            別再憑感覺投廣告了！
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-600 font-semibold mb-8">
            這不是另一堂教你理論的課，我直接給你一套能提升 ROAS 的作戰系統。
          </p>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
              <div className="flex-shrink-0">
                <img 
                  src="/teacher-black-photo.png" 
                  alt="邱煜庭 小黑老師" 
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-lg"
                />
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  我是邱煜庭，大家都叫我「小黑老師」
                </h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  十餘年來，我從 MIS、網站企劃做起，歷任 uitox 全球電商集團行銷總監、百腦匯中國總部行銷經理，行銷理論應用在中國、美國、台灣、日本等地、三十餘個不同的產業，都能有效的運用我的行銷邏輯來開創電商業績。現在是燒賣研究所首席顧問。我專精「集客式行銷」，著有《網路集客力》一書，被譽為台灣電商界的「肉搏戰策略」專家，教臉書廣告更是十多年未曾間斷。
                </p>
                <p className="text-lg text-blue-600 font-semibold">
                  我不教理論，只給你能立刻執行的實戰系統。
                </p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                你是否也曾盯著 Facebook 廣告後台的數字，心中充滿疑問：「我的廣告費，真的花在刀口上了嗎？」「為什麼別人的廣告會賺錢，我的卻總是在燒錢？」你買了課程、看了文章，但到了設定預算那一步，依然只能靠「感覺」下決定。
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4 font-medium">
                如果你對以上情境心有戚戚焉，那麼，這不僅僅是一堂直播課，這是你一直在尋找的答案。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 第二部分：痛點 - The Pain */}
      <section className="py-16 px-4 bg-red-50 dark:bg-red-900/10">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            你是否也正被這些問題困擾？
          </h2>
          
          <div className="grid gap-6">
            {painPoints.map((pain, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md flex items-start gap-4">
                <div className="w-6 h-6 border-2 border-red-500 rounded flex-shrink-0 mt-1"></div>
                <p className="text-lg text-gray-700 dark:text-gray-300">{pain}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-xl text-red-600 dark:text-red-400 font-semibold">
              如果以上問題讓你頻頻點頭，繼續往下看...
            </p>
          </div>
        </div>
      </section>

      {/* 第三部分：解方 - The Solution */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            與其給你另一套理論，我決定直接給你一套「作戰系統」
          </h2>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8 mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                <Zap className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              我深知廣告主的痛點。所以這次，我不做空泛的理論教學。我將透過一場 <strong>2.5 小時的直播實戰</strong>，直接帶你上手我千錘百鍊，十餘年的經驗化成的產品、專為電商廣告主打造的 SaaS 平台——「報數據」。
            </p>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 inline-block">
              <p className="text-2xl font-bold text-blue-600 mb-2">
                這套系統，將成為你的 AI 廣告軍師
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 第四部分：價值展示 - The Value */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            這不只是一堂課，這是一個限量的「創始會員資格包」
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* 價值一：軟體 */}
            <Card className="relative overflow-hidden border-2 border-blue-200 hover:border-blue-400 transition-all">
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 text-sm font-medium">
                核心價值
              </div>
              <CardHeader className="text-center pt-8">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">
                  【企業級軟體】「報數據」平台終身使用權
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  你將獲得一個需要帳號登入、整合了 GA4 與 Facebook API、並由 GPT-4 驅動的私有軟體。它包含三大核心引擎：GA 預算計算機、Pro 級活動規劃師、以及 AI 廣告健檢系統。
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  未來獨立年費售價：NT$12,800
                </p>
              </CardContent>
            </Card>

            {/* 價值二：直播 */}
            <Card className="relative overflow-hidden border-2 border-green-200 hover:border-green-400 transition-all">
              <div className="absolute top-0 right-0 bg-green-600 text-white px-3 py-1 text-sm font-medium">
                專家親授
              </div>
              <CardHeader className="text-center pt-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">
                  【專家親自帶飛】2.5 小時直播實戰工作坊
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  我將在線上親自帶你完成所有設定，從 Google/Facebook 帳號串接到平台核心功能操作。你有任何問題，當場提問，我當場回答。
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  價值：NT$4,800
                </p>
              </CardContent>
            </Card>

            {/* 價值三：課程 */}
            <Card className="relative overflow-hidden border-2 border-orange-200 hover:border-orange-400 transition-all">
              <div className="absolute top-0 right-0 bg-orange-600 text-white px-3 py-1 text-sm font-medium">
                完整體系
              </div>
              <CardHeader className="text-center pt-8">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">
                  【完整知識體系】FB 廣告成效攻略線上課程
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  除了直播實戰，你還能獲得小黑老師完整的預錄線上課程。作為你的永久學習後盾，讓你隨時可以複習、深入研究廣告投放的每一個細節。
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  定價：NT$3,980
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 第五部分：定價與行動呼籲 - CTA & Pricing */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-12">
            成為我的創始會員，只需一次性的投資
          </h2>
          
          {/* 價值錨定 */}
          <div className="bg-white/10 rounded-xl p-8 mb-12 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-6">總價值計算</h3>
            <div className="space-y-3 text-lg">
              <div className="flex justify-between">
                <span>SaaS 平台終身使用權：</span>
                <span className="line-through">NT$12,800+</span>
              </div>
              <div className="flex justify-between">
                <span>直播實戰工作坊：</span>
                <span className="line-through">NT$4,800</span>
              </div>
              <div className="flex justify-between">
                <span>完整線上課程：</span>
                <span className="line-through">NT$3,980</span>
              </div>
              <hr className="border-white/30" />
              <div className="flex justify-between text-xl font-bold">
                <span>總價值：</span>
                <span>超過 NT$21,580</span>
              </div>
            </div>
          </div>
          
          {/* 震撼定價 */}
          <div className="bg-white text-gray-900 rounded-2xl p-12 mb-8 max-w-lg mx-auto shadow-2xl">
            <div className="mb-6">
              <p className="text-lg text-gray-600 mb-2">創始會員資格，僅需：</p>
              <div className="text-6xl font-bold text-red-600 mb-2">
                NT$ 5,990
              </div>
              <p className="text-sm text-gray-500">（全球僅限 300 席，額滿即止）</p>
            </div>
            
            <Link href="/subscription-checkout?plan=founders&priceId=price_0Rnx9tYDQY3sAQESumeM9k1g">
              <Button 
                size="lg" 
                className="w-full h-16 text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg transform hover:scale-105 transition-all"
              >
                <Gift className="w-6 h-6 mr-2" />
                立即鎖定我的創始會員席次
              </Button>
            </Link>
            
            <p className="text-sm text-gray-500 mt-4">
              名額倒數中，額滿將永久關閉此方案
            </p>
          </div>
          
          <div className="flex justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>30天滿意保證</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>終身免費更新</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>專屬客服支援</span>
            </div>
          </div>
        </div>
      </section>

      {/* 第六部分：課程核心內容 - Core Curriculum */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              這堂課，我要教你的四大核心心法
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              十餘年實戰經驗濃縮成的精華系統，每一個環節都能直接轉化為你的廣告收益
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* 心法一：目標設定 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-700 hover:shadow-xl transition-all">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  廣告起手式：從「目標」開始
                </h3>
              </div>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                  <strong className="text-blue-600">目標營業額是多少？轉換率要提升多少？客單價要提升多少？</strong>
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  這些不先設定，基本上廣告就是漫無目的的亂投。只靠「我要有訂單」根本是瞎話，沒有規劃的廣告投遞就是瞎忙。
                </p>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-600">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    💡 我的 SaaS 系統會幫你精準計算每個目標數字
                  </p>
                </div>
              </div>
            </div>

            {/* 心法二：放大優勢 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 border-2 border-green-200 dark:border-green-700 hover:shadow-xl transition-all">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  優化心法：放大有效組合
                </h3>
              </div>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                  <strong className="text-green-600">廣告的優化不是一直去「修正錯誤」，而是要放大有效的廣告組合跟廣告。</strong>
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  我知道這對台灣教育體系長大的你很難體會，因為我們習慣拿不到100分就是錯的，卻沒有想過要在95分的領域裡發光發熱。找出有效的廣告跟受眾放大才是 ROAS 的正解。
                </p>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-green-600">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    🚀 我設計的 SaaS 就是來幫你找到這個可能
                  </p>
                </div>
              </div>
            </div>

            {/* 心法三：正確受眾 */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-8 border-2 border-orange-200 dark:border-orange-700 hover:shadow-xl transition-all">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  受眾心法：跟正確的人說話
                </h3>
              </div>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                  <strong className="text-orange-600">有效的廣告必須基於「跟正確的人說話」</strong>
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  我們的人生太習慣單向的標準答案，不習慣創造一個雙向的溝通方式。但沒關係，我設計的 GPT 就是來幫你開啟你跟潛在受眾對話的方式。
                </p>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-orange-600">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    🤖 AI 驅動的受眾分析系統，讓你找到真正的目標客群
                  </p>
                </div>
              </div>
            </div>

            {/* 心法四：PDCA系統 */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 rounded-2xl p-8 border-2 border-purple-200 dark:border-purple-700 hover:shadow-xl transition-all">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-xl">4</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  成效心法：PDCA 優化循環
                </h3>
              </div>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                  <strong className="text-purple-600">更多的 PDCA 的 FB 成效優化邏輯</strong>
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  上完直播課後，九月有更多內容等待你的學習，包含如何有效產出報表以及數據解讀，都等著你繼續成長。
                </p>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-purple-600">
                  <a 
                    href="https://www.pressplay.cc/project/FF791253840096414A3230304489197A/about" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2 transition-colors"
                  >
                    📚 完整學習：《FB 廣告成效攻略》線上課程
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 價值總結 */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-3xl font-bold mb-4">
              光這四大心法，就值回票價
            </h3>
            <p className="text-xl opacity-90 mb-6">
              十餘年實戰淬煉 × AI 智能輔助 × 完整系統工具 = 你的廣告致勝關鍵
            </p>
            <div className="flex justify-center items-center gap-4">
              <span className="text-2xl font-bold">只要 NT$ 5,990</span>
              <span className="text-lg opacity-75">就能獲得價值超過 NT$ 21,580 的完整系統</span>
            </div>
          </div>
        </div>
      </section>

      {/* 第七部分：受眾輪廓 - Target Audience */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            如果你符合以下任何一點，這就是為你設計的
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* 適合的人 */}
            <div>
              <h3 className="text-2xl font-bold text-green-600 mb-6 flex items-center gap-2">
                <CheckCircle className="w-8 h-8" />
                適合這堂課的人
              </h3>
              <div className="space-y-4">
                {targetAudience.map((audience, index) => (
                  <Card key={index} className="border-green-200 hover:border-green-400 transition-all">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {audience.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {audience.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* 不適合的人 */}
            <div>
              <h3 className="text-2xl font-bold text-red-600 mb-6 flex items-center gap-2">
                <XCircle className="w-8 h-8" />
                不適合這堂課的人
              </h3>
              <div className="space-y-4">
                {notSuitableFor.map((item, index) => (
                  <Card key={index} className="border-red-200 hover:border-red-400 transition-all">
                    <CardContent className="p-4">
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {item}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 第七部分：FAQ */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            常見問題
          </h2>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Q: {faq.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    A: {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 最終行動呼籲 */}
      <section className="py-16 px-4 bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            不要讓機會溜走
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            300 個創始會員席次，一旦額滿，這個價格就永遠不會再出現
          </p>
          
          <Link href="/subscription-checkout?plan=founders&priceId=price_0Rnx9tYDQY3sAQESumeM9k1g">
            <Button 
              size="lg" 
              className="h-16 px-12 text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg transform hover:scale-105 transition-all"
            >
              最後機會 - 立即加入創始會員
              <ChevronRight className="w-6 h-6 ml-2" />
            </Button>
          </Link>
          
          <p className="text-sm text-gray-400 mt-6">
            點擊按鈕後，您將被導向安全的付款頁面
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="mb-4">
            <div className="text-2xl font-bold text-blue-400 mb-2">報數據</div>
            <p className="text-gray-400">專業電商廣告分析平台</p>
          </div>
          <div className="text-sm text-gray-500">
            <p>&copy; 2025 煜言顧問有限公司(TW) | 燈言顧問株式会社(JP). All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}