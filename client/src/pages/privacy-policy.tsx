import { Link } from "wouter";
import { ArrowLeft, Shield, Eye, Lock, UserCheck, Facebook } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";
import { getTranslations, type Locale } from "@/lib/i18n";

interface PrivacyPolicyProps {
  locale: Locale;
}

export default function PrivacyPolicy({ locale }: PrivacyPolicyProps) {
  const t = getTranslations(locale);

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
            <h1 className="text-2xl font-bold text-gray-900">隱私政策</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">資料保護承諾</h2>
                  <p className="text-gray-700 leading-relaxed">
                    我們重視您的隱私權。本隱私政策說明我們如何收集、使用和保護您在使用廣告預算計算機時提供的資訊。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Collection */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">我們收集的資訊</h2>
                  <div className="text-gray-700 space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">基本資料收集：</h3>
                      <ul className="space-y-1 ml-4">
                        <li>• 您輸入的營收目標、客單價和轉換率等計算參數</li>
                        <li>• Google Analytics 連接時的帳戶資訊</li>
                        <li>• 網站使用情況和互動數據（透過 Google Analytics 和 Meta Pixel）</li>
                        <li>• 您的電子郵件地址（當您選擇提供時）</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Facebook 資料收集：</h3>
                      <ul className="space-y-1 ml-4">
                        <li>• Facebook 登入授權後的基本個人資料（姓名、電子郵件、個人頭像）</li>
                        <li>• Facebook 廣告帳戶資訊（僅限您授權存取的廣告帳戶）</li>
                        <li>• 廣告投放數據（包括但不限於：廣告花費、點擊率、轉換率、ROAS）</li>
                        <li>• 廣告活動表現統計資訊（用於生成 AI 建議報告）</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>重要說明：</strong>我們只會在您明確授權後才存取您的 Facebook 資料，且僅用於提供廣告成效分析服務。我們不會儲存敏感的廣告資料，所有分析僅在您的瀏覽器中進行。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Usage */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <UserCheck className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">資訊使用方式</h2>
                  <div className="text-gray-700 space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">核心服務提供：</h3>
                      <ul className="space-y-1 ml-4">
                        <li>• 提供廣告預算計算服務</li>
                        <li>• 生成 Facebook 廣告成效分析報告</li>
                        <li>• 提供個人化的廣告優化建議</li>
                        <li>• 活動預算規劃和分配建議</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Facebook 資料使用目的：</h3>
                      <ul className="space-y-1 ml-4">
                        <li>• 分析您的廣告帳戶表現並提供診斷報告</li>
                        <li>• 計算廣告投資回報率 (ROAS) 和效能指標</li>
                        <li>• 識別表現優異的廣告創意和受眾</li>
                        <li>• 提供基於 AI 的廣告優化建議</li>
                        <li>• 比較實際表現與目標設定的差異</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">其他用途：</h3>
                      <ul className="space-y-1 ml-4">
                        <li>• 改善服務品質和用戶體驗</li>
                        <li>• 發送相關的行銷資訊（需經您同意）</li>
                        <li>• 網站分析和效能優化</li>
                        <li>• 技術支援和客戶服務</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>資料使用限制：</strong>我們承諾僅將您的 Facebook 資料用於上述明確目的，不會用於任何其他商業用途或與第三方分享。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Facebook Data Protection */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Facebook className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Facebook 資料保護與權限</h2>
                  <div className="text-gray-700 space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Facebook 登入權限說明：</h3>
                      <ul className="space-y-1 ml-4">
                        <li>• <strong>基本資料存取：</strong>我們會讀取您的 Facebook 基本資料（姓名、電子郵件、個人頭像）</li>
                        <li>• <strong>廣告帳戶存取：</strong>我們會讀取您的 Facebook 廣告帳戶資訊和投放數據</li>
                        <li>• <strong>廣告成效數據：</strong>我們會讀取您的廣告活動表現數據以提供分析服務</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">權限使用限制：</h3>
                      <ul className="space-y-1 ml-4">
                        <li>• 我們只會存取您明確授權的資料</li>
                        <li>• 我們不會修改或刪除您的 Facebook 廣告資料</li>
                        <li>• 我們不會代表您發布任何內容到 Facebook</li>
                        <li>• 我們不會與任何第三方分享您的 Facebook 資料</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">資料保留政策：</h3>
                      <ul className="space-y-1 ml-4">
                        <li>• 基本資料：儲存至您停用帳戶為止</li>
                        <li>• 廣告數據：僅在分析過程中臨時處理，不長期儲存</li>
                        <li>• 分析報告：保存 30 天供您查看</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>用戶權利：</strong>您可以隨時在 Facebook 設定中撤銷我們的應用程式存取權限，或聯絡我們要求刪除您的資料。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-start space-x-4">
                <div className="bg-red-100 p-3 rounded-lg">
                  <Lock className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">資料安全</h2>
                  <div className="text-gray-700 space-y-4">
                    <p>我們採用業界標準的安全措施來保護您的個人資訊：</p>
                    <ul className="space-y-2">
                      <li>• SSL 加密傳輸</li>
                      <li>• 安全的資料庫存儲</li>
                      <li>• 定期安全更新和監控</li>
                      <li>• 嚴格的訪問控制</li>
                      <li>• Facebook OAuth 2.0 安全認證</li>
                      <li>• 資料加密和存取日誌監控</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Third Party Services */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第三方服務</h2>
              <div className="text-gray-700 space-y-4">
                <p>我們使用以下第三方服務來提供更好的用戶體驗：</p>
                <ul className="space-y-2">
                  <li>• <strong>Google Analytics：</strong>網站流量分析</li>
                  <li>• <strong>Meta Pixel：</strong>廣告效果追蹤</li>
                  <li>• <strong>Brevo：</strong>電子郵件行銷服務</li>
                  <li>• <strong>Google OAuth：</strong>安全登入驗證</li>
                </ul>
                <p className="mt-4">
                  這些服務都有自己的隱私政策，我們建議您也要了解它們的資料處理方式。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">聯絡我們</h2>
              <div className="text-gray-700">
                <p className="mb-4">如果您對本隱私政策有任何疑問，請透過以下方式聯絡我們：</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">煜言顧問有限公司</p>
                  <p>網站：<a href="https://thinkwithblack.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">thinkwithblack.com</a></p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Last Updated */}
          <div className="text-center text-gray-500 text-sm">
            最後更新：2025年7月9日
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}