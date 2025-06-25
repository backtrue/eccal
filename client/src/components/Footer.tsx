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
                {getCurrentLocale() === 'zh-TW' ? '報數據｜幫你算廣告預算' :
                 getCurrentLocale() === 'en' ? 'ReportData | Ad Budget Calculator' :
                 'データ報告｜広告予算計算機'}
              </a>
            </h3>
            <p className="text-gray-300 mb-4">
              {getCurrentLocale() === 'zh-TW' ? 
                '想知道廣告預算怎麼抓？用《報數據》一鍵計算 FB、IG 廣告預算和所需流量，只要輸入目標金額、客單價、轉換率，馬上算出最適合你的廣告預算與流量需求，幫你告別瞎猜和試錯！' :
               getCurrentLocale() === 'en' ?
                'Want to know how much to spend on ads? Use ReportData to calculate FB and IG ad budgets and required traffic with one click. Just input your target revenue, average order value, and conversion rate to instantly calculate the optimal ad budget and traffic requirements. Say goodbye to guessing and trial-and-error!' :
                '広告予算をどう決めるかわからない？『データ報告』でFB・IG広告予算と必要トラフィックをワンクリック計算。目標売上、平均注文額、コンバージョン率を入力するだけで、最適な広告予算とトラフィック要件をすぐに算出。推測や試行錯誤とはもうお別れ！'}
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
                <Link href="/privacy-policy" className="text-gray-300 hover:text-white transition-colors">
                  {t.privacy}
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-gray-300 hover:text-white transition-colors">
                  {t.terms}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 {getCurrentLocale() === 'zh-TW' ? '煜言顧問有限公司' : 
                      <a href="https://toldyou.co" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                        ToldYou Co.
                      </a>}. {t.allRightsReserved}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}