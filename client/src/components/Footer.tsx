import { Link } from "wouter";

export default function Footer() {
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
                報數據
              </a>
              -電商廣告預算計算機
            </h3>
            <p className="text-gray-300 mb-4 max-w-md">
              專業的廣告預算規劃工具，幫助電商企業精準計算廣告投放預算，優化行銷策略，提升營收表現。
            </p>
            <div className="text-sm text-gray-400">
              © 2025 報數據 由 煜言顧問有限公司(TW) 及 <a 
                href="https://www.toldyou.co/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-300 transition-colors"
              >
                燈言顧問株式会社(JP)
              </a> 提供. All Rights Reserved.
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">快速連結</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.pressplay.cc/link/s/88C22BDC" 
                  className="text-gray-300 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  電商教學
                </a>
              </li>
              <li>
                <a 
                  href="https://www.pressplay.cc/link/s/5355C492" 
                  className="text-gray-300 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  FB廣告初階教學
                </a>
              </li>
              <li>
                <a 
                  href="https://www.pressplay.cc/link/s/CAD627D3" 
                  className="text-gray-300 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  FB廣告進階教學
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-4">法律條款</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://thinkwithblack.com/privacy" 
                  className="text-gray-300 hover:text-white transition-colors"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                >
                  隱私權政策
                </a>
              </li>
              <li>
                <a 
                  href="https://thinkwithblack.com/terms" 
                  className="text-gray-300 hover:text-white transition-colors"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                >
                  使用者條款
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              本工具僅供參考，實際廣告成本可能因市場狀況而異。
            </div>
            <div className="flex space-x-6 text-sm">
              <a 
                href="https://thinkwithblack.com/privacy" 
                className="text-gray-400 hover:text-white transition-colors"
                target="_blank"
                rel="nofollow noopener noreferrer"
              >
                隱私權政策
              </a>
              <a 
                href="https://thinkwithblack.com/terms" 
                className="text-gray-400 hover:text-white transition-colors"
                target="_blank"
                rel="nofollow noopener noreferrer"
              >
                使用者條款
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}