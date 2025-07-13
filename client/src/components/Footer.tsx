import { Link, useLocation } from "wouter";
import { getTranslations, type Locale } from "@/lib/i18n";

export default function Footer() {
  const [location] = useLocation();
  
  const getCurrentLocale = (): Locale => {
    if (location.startsWith('/en')) return 'en';
    if (location.startsWith('/jp')) return 'ja';
    return 'zh-TW';
  };
  
  const t = getTranslations(getCurrentLocale());

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4">
              <a 
                href="https://thinkwithblack.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-300 transition-colors"
              >
                {getCurrentLocale() === 'zh-TW' ? '報數據｜專業電商廣告分析平台' :
                 getCurrentLocale() === 'en' ? 'ReportData | Professional E-commerce Advertising Analytics Platform' :
                 'データ報告｜プロフェッショナル電子商取引広告分析プラットフォーム'}
              </a>
            </h3>
            <p className="text-gray-300 mb-4">
              {getCurrentLocale() === 'zh-TW' ? 
                '讓廣告操作者，擁有看懂數據與主導策略的能力。我們整合實戰經驗，從 GA 數據到 Facebook 廣告指標，幫助你看懂每個成效背後的意義。不再靠運氣亂投，成為能夠獨立企劃、拆解成效、提出優化建議的廣告策略專家。' :
               getCurrentLocale() === 'en' ?
                'Empowering advertisers with data understanding and strategic leadership capabilities. We integrate practical experience from GA data to Facebook advertising metrics, helping you understand the meaning behind every performance metric. No more random spending - become an advertising strategy expert who can independently plan, analyze, and optimize.' :
                '広告担当者がデータを理解し、戦略を主導する能力を身につけることを支援します。GAデータからFacebook広告指標まで、実戦経験を統合し、すべてのパフォーマンス指標の背後にある意味を理解できるようお手伝いします。もう運に頼った投資は必要ありません。'}
            </p>
            <p className="text-gray-300 mb-4 text-sm">
              {getCurrentLocale() === 'zh-TW' ? 
                '廣告與服務合作請寄信至：' :
               getCurrentLocale() === 'en' ?
                'For advertising and service partnerships, please email: ' :
                '広告およびサービス提携については、メールでお問い合わせください：'}
              <a 
                href="mailto:backtrue@thinkwithblack.com" 
                className="text-blue-300 hover:text-blue-200 transition-colors"
              >
                backtrue@thinkwithblack.com
              </a>
            </p>
          </div>

          {/* Course Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">
              {getCurrentLocale() === 'zh-TW' ? '我們的課程' :
               getCurrentLocale() === 'en' ? 'Our Courses' :
               '私たちのコース'}
            </h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.pressplay.cc/link/s/88C22BDC" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {getCurrentLocale() === 'zh-TW' ? '電商教學' :
                   getCurrentLocale() === 'en' ? 'E-commerce Training' :
                   'ECサイト教育'}
                </a>
              </li>
              <li>
                <a 
                  href="https://www.pressplay.cc/link/s/5355C492" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {getCurrentLocale() === 'zh-TW' ? 'FB廣告初階教學' :
                   getCurrentLocale() === 'en' ? 'FB Ads Beginner Course' :
                   'FB広告基礎コース'}
                </a>
              </li>
              <li>
                <a 
                  href="https://www.pressplay.cc/link/s/CAD627D3" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {getCurrentLocale() === 'zh-TW' ? 'FB廣告進階教學' :
                   getCurrentLocale() === 'en' ? 'FB Ads Advanced Course' :
                   'FB広告上級コース'}
                </a>
              </li>
            </ul>
          </div>

          {/* Service Content */}
          <div>
            <h4 className="text-lg font-semibold mb-4">
              {getCurrentLocale() === 'zh-TW' ? '服務內容' :
               getCurrentLocale() === 'en' ? 'Services' :
               'サービス内容'}
            </h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href={getCurrentLocale() === 'zh-TW' ? 'https://blog.thinkwithblack.com' : 
                       getCurrentLocale() === 'ja' ? 'https://note.com/backtrue' : 
                       'https://medium.com/@backtrue_24010'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t.blog}
                </a>
              </li>
              <li>
                <Link href={getCurrentLocale() === 'zh-TW' ? '/pricing' :
                           getCurrentLocale() === 'en' ? '/en/pricing' :
                           '/jp/pricing'} 
                      className="text-gray-300 hover:text-white transition-colors">
                  {t.pricingLabel}
                </Link>
              </li>
              <li>
                <Link href={getCurrentLocale() === 'zh-TW' ? '/about' :
                           getCurrentLocale() === 'en' ? '/en/about' :
                           '/jp/about'} 
                      className="text-gray-300 hover:text-white transition-colors">
                  {t.about.title}
                </Link>
              </li>
              <li>
                <a 
                  href="https://thinkwithblack.com/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t.privacy}
                </a>
              </li>
              <li>
                <a 
                  href="https://thinkwithblack.com/terms" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t.terms}
                </a>
              </li>
              <li>
                <Link href={getCurrentLocale() === 'zh-TW' ? '/help/calculator' :
                           getCurrentLocale() === 'en' ? '/en/help/calculator' :
                           '/jp/help/calculator'} 
                      className="text-gray-300 hover:text-white transition-colors">
                  {getCurrentLocale() === 'zh-TW' ? '預算計算機說明' :
                   getCurrentLocale() === 'en' ? 'Budget Calculator Guide' :
                   '予算計算機説明'}
                </Link>
              </li>
              <li>
                <Link href={getCurrentLocale() === 'zh-TW' ? '/help/campaign-planner' :
                           getCurrentLocale() === 'en' ? '/en/help/campaign-planner' :
                           '/jp/help/campaign-planner'} 
                      className="text-gray-300 hover:text-white transition-colors">
                  {getCurrentLocale() === 'zh-TW' ? '活動規劃師說明' :
                   getCurrentLocale() === 'en' ? 'Campaign Planner Guide' :
                   'キャンペーンプランナー説明'}
                </Link>
              </li>
              <li>
                <Link href={getCurrentLocale() === 'zh-TW' ? '/help/fbaudit' :
                           getCurrentLocale() === 'en' ? '/en/help/fbaudit' :
                           '/jp/help/fbaudit'} 
                      className="text-gray-300 hover:text-white transition-colors">
                  {getCurrentLocale() === 'zh-TW' ? 'FB廣告健檢說明' :
                   getCurrentLocale() === 'en' ? 'FB Ads Health Check Guide' :
                   'FB広告ヘルスチェック説明'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col items-center space-y-4">
            {/* 四個主要服務連結 */}
            <div className="flex justify-center items-center gap-2 text-blue-300">
              <a 
                href="https://eccal.thinkwithblack.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-200 transition-colors font-medium"
              >
                報數據
              </a>
              <span className="text-gray-400">｜</span>
              <a 
                href="https://audai.thinkwithblack.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-200 transition-colors font-medium"
              >
                報受眾
              </a>
              <span className="text-gray-400">｜</span>
              <a 
                href="https://quote.thinkwithblack.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-200 transition-colors font-medium"
              >
                報價
              </a>
              <span className="text-gray-400">｜</span>
              <a 
                href="https://thinkwithblack.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-200 transition-colors font-medium"
              >
                報 LINE
              </a>
            </div>
            
            {/* 版權聲明 */}
            <p className="text-gray-400 text-sm">
              © 2025 {getCurrentLocale() === 'zh-TW' ? 
                <>煜言顧問有限公司(TW) <a href="https://toldyou.co" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">燈言顧問株式会社(JP)</a></> : 
                <a href="https://toldyou.co" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  ToldYou Co.
                </a>
              } 版權所有
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}