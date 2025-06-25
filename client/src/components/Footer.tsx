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
                報數據｜幫你算廣告預算
              </a>
            </h3>
            <p className="text-gray-300 mb-4">
              想知道廣告預算怎麼抓？用《報數據》一鍵計算 FB、IG 廣告預算和所需流量，只要輸入目標金額、客單價、轉換率，馬上算出最適合你的廣告預算與流量需求，幫你告別瞎猜和試錯！
            </p>
          </div>

          {/* Course Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">我們的課程</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.pressplay.cc/link/s/88C22BDC" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  電商教學
                </a>
              </li>
              <li>
                <a 
                  href="https://www.pressplay.cc/link/s/5355C492" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  FB廣告初階教學
                </a>
              </li>
              <li>
                <a 
                  href="https://www.pressplay.cc/link/s/CAD627D3" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  FB廣告進階教學
                </a>
              </li>
            </ul>
          </div>

          {/* Service Content */}
          <div>
            <h4 className="text-lg font-semibold mb-4">服務內容</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  {t.home}
                </Link>
              </li>
              <li>
                <a 
                  href={getCurrentLocale() === 'zh-TW' ? 'https://blog.thinkwithblack.com' : 
                       getCurrentLocale() === 'ja' ? 'https://note.com/backtrue' : 
                       'https://medium.com/@backtrue_24010'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  部落格
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