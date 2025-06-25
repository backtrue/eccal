import { Link } from "wouter";
import { ArrowLeft, FileText, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700 mr-4">
              <ArrowLeft className="w-5 h-5 mr-2" />
              返回計算機
            </Link>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">使用者條款</h1>
                <p className="text-sm text-gray-600">服務使用規範與條件</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-lg border border-gray-200">
          <CardContent className="p-8">
            <div className="prose max-w-none">
              <div className="mb-8">
                <p className="text-gray-600 mb-4">最後更新日期：2025年6月25日</p>
                <p className="text-lg text-gray-700">
                  歡迎使用電商廣告預算計算機。使用本服務即表示您同意遵守以下條款。
                </p>
              </div>

              <div className="space-y-8">
                <section>
                  <div className="flex items-center space-x-2 mb-4">
                    <CheckCircle className="text-green-600 w-5 h-5" />
                    <h2 className="text-xl font-semibold text-gray-900">服務說明</h2>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-green-800 mb-3">
                      本計算機提供電商廣告預算估算服務，基於以下參數進行計算：
                    </p>
                    <ul className="text-green-800 space-y-1">
                      <li>• 目標營業額（月）</li>
                      <li>• 平均客單價</li>
                      <li>• 網站轉換率</li>
                      <li>• 固定點擊成本（CPC = NTD 5）</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <div className="flex items-center space-x-2 mb-4">
                    <AlertTriangle className="text-yellow-600 w-5 h-5" />
                    <h2 className="text-xl font-semibold text-gray-900">重要聲明</h2>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <ul className="text-yellow-800 space-y-2">
                      <li>• 本工具提供的計算結果僅供參考</li>
                      <li>• 實際廣告成本可能因市場狀況、競爭環境等因素而有所差異</li>
                      <li>• 建議結合實際業務情況和專業意見制定廣告策略</li>
                      <li>• 我們不保證使用本工具能達到預期的廣告效果</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">使用規範</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        允許的使用
                      </h3>
                      <ul className="text-green-800 space-y-1 text-sm">
                        <li>• 個人或商業用途的預算規劃</li>
                        <li>• 教育和學習目的</li>
                        <li>• 合理頻率的工具使用</li>
                        <li>• 分享計算結果給他人參考</li>
                      </ul>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-red-900 mb-2 flex items-center">
                        <XCircle className="w-4 h-4 mr-2" />
                        禁止的使用
                      </h3>
                      <ul className="text-red-800 space-y-1 text-sm">
                        <li>• 惡意攻擊或破壞服務</li>
                        <li>• 自動化爬蟲或大量請求</li>
                        <li>• 逆向工程或複製功能</li>
                        <li>• 散布不實資訊或誤導他人</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>  
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">智慧財產權</h2>
                  <p className="text-gray-700 mb-4">
                    本網站的所有內容，包括但不限於文字、圖片、設計、程式碼和商標，
                    均受智慧財產權法保護。未經授權，不得複製、修改或商業使用。
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">免責聲明</h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800 mb-3">
                      我們致力於提供準確可靠的計算服務，但：
                    </p>
                    <ul className="text-gray-800 space-y-1">
                      <li>• 不保證服務的完全準確性和可用性</li>
                      <li>• 不對因使用本服務而產生的任何損失負責</li>
                      <li>• 保留隨時修改或終止服務的權利</li>
                      <li>• 使用者應自行承擔使用風險</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">服務變更</h2>
                  <p className="text-gray-700 mb-4">
                    我們保留隨時修改、暫停或終止服務的權利，恕不另行通知。
                    重大變更將盡可能提前在網站上公告。
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">適用法律</h2>
                  <p className="text-gray-700 mb-4">
                    本條款受中華民國法律管轄。如有爭議，以台灣法院為管轄法院。
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">聯絡資訊</h2>
                  <p className="text-gray-700">
                    如對本條款有任何疑問，請透過網站提供的聯絡方式與我們聯繫。
                    我們將盡快回覆您的詢問。
                  </p>
                </section>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}