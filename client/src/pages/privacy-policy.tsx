import { Link } from "wouter";
import { ArrowLeft, Shield, Eye, Lock, UserCheck } from "lucide-react";
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
                  <ul className="text-gray-700 space-y-2">
                    <li>• 您輸入的營收目標、客單價和轉換率等計算參數</li>
                    <li>• Google Analytics 連接時的帳戶資訊</li>
                    <li>• 網站使用情況和互動數據（透過 Google Analytics 和 Meta Pixel）</li>
                    <li>• 您的電子郵件地址（當您選擇提供時）</li>
                  </ul>
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
                  <ul className="text-gray-700 space-y-2">
                    <li>• 提供廣告預算計算服務</li>
                    <li>• 改善服務品質和用戶體驗</li>
                    <li>• 發送相關的行銷資訊（需經您同意）</li>
                    <li>• 網站分析和效能優化</li>
                  </ul>
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
            最後更新：2025年6月25日
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}