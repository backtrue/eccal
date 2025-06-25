import { Link } from "wouter";
import { ArrowLeft, Shield, Eye, Lock, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
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
                <Shield className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">報數據-隱私權政策</h1>
                <p className="text-sm text-gray-600">我們如何保護您的個人資料</p>
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
                  我們重視您的隱私權，本政策說明我們如何收集、使用和保護您的個人資料。
                </p>
              </div>

              <div className="space-y-8">
                <section>
                  <div className="flex items-center space-x-2 mb-4">
                    <Eye className="text-blue-600 w-5 h-5" />
                    <h2 className="text-xl font-semibold text-gray-900">資料收集</h2>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold text-blue-900 mb-2">我們收集的資料類型：</h3>
                    <ul className="text-blue-800 space-y-1">
                      <li>• 您在計算機中輸入的業務數據（目標營業額、客單價、轉換率）</li>
                      <li>• 瀏覽器類型和版本資訊</li>
                      <li>• IP 地址和地理位置（僅用於分析流量來源）</li>
                      <li>• 網站使用行為和偏好設定</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <div className="flex items-center space-x-2 mb-4">
                    <UserCheck className="text-green-600 w-5 h-5" />
                    <h2 className="text-xl font-semibold text-gray-900">資料使用目的</h2>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <ul className="text-green-800 space-y-2">
                      <li>• 提供精確的廣告預算計算服務</li>
                      <li>• 改善網站功能和使用者體驗</li>
                      <li>• 進行網站流量分析和效能優化</li>
                      <li>• 遵守法律法規要求</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <div className="flex items-center space-x-2 mb-4">
                    <Lock className="text-purple-600 w-5 h-5" />
                    <h2 className="text-xl font-semibold text-gray-900">資料保護措施</h2>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <ul className="text-purple-800 space-y-2">
                      <li>• 使用 HTTPS 加密傳輸所有資料</li>
                      <li>• 採用業界標準的安全防護措施</li>
                      <li>• 定期進行安全性檢查和更新</li>
                      <li>• 限制員工對個人資料的存取權限</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">資料保存期限</h2>
                  <p className="text-gray-700 mb-4">
                    我們僅在必要期間保存您的個人資料。計算數據不會永久儲存在我們的伺服器上，
                    瀏覽記錄和分析數據最多保存 24 個月。
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">您的權利</h2>
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-yellow-800 mb-2">您有權要求：</p>
                    <ul className="text-yellow-800 space-y-1">
                      <li>• 查閱我們所持有關於您的個人資料</li>
                      <li>• 要求更正不準確的個人資料</li>
                      <li>• 要求刪除您的個人資料</li>
                      <li>• 反對處理您的個人資料</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Cookie 使用</h2>
                  <p className="text-gray-700 mb-4">
                    我們使用 Cookie 來改善您的瀏覽體驗，包括記住您的偏好設定和分析網站使用情況。
                    您可以通過瀏覽器設定控制 Cookie 的使用。
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">政策更新</h2>
                  <p className="text-gray-700 mb-4">
                    我們可能會不定期更新本隱私權政策。重大變更將在網站上公告，
                    並在適當情況下直接通知您。
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">聯絡我們</h2>
                  <p className="text-gray-700">
                    如果您對本隱私權政策有任何疑問或需要行使您的權利，
                    請透過網站上提供的聯絡方式與我們聯繫。
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