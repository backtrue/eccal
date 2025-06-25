import { Link } from "wouter";
import { ArrowLeft, FileText, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";
import { getTranslations, type Locale } from "@/lib/i18n";

interface TermsOfServiceProps {
  locale: Locale;
}

export default function TermsOfService({ locale }: TermsOfServiceProps) {
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
            <h1 className="text-2xl font-bold text-gray-900">服務條款</h1>
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
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">服務條款</h2>
                  <p className="text-gray-700 leading-relaxed">
                    歡迎使用我們的廣告預算計算機服務。透過使用本服務，您同意遵守以下服務條款。請仔細閱讀這些條款。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">服務說明</h2>
                  <div className="text-gray-700 space-y-4">
                    <p>我們提供的服務包括：</p>
                    <ul className="space-y-2">
                      <li>• 廣告預算計算工具</li>
                      <li>• Google Analytics 數據整合</li>
                      <li>• 電商廣告策略建議</li>
                      <li>• 相關教育資源和課程資訊</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-start space-x-4">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">使用者責任</h2>
                  <div className="text-gray-700 space-y-4">
                    <p>使用本服務時，您同意：</p>
                    <ul className="space-y-2">
                      <li>• 提供準確的資訊和數據</li>
                      <li>• 不濫用或干擾服務運作</li>
                      <li>• 遵守所有適用的法律法規</li>
                      <li>• 保護您的帳戶安全</li>
                      <li>• 尊重其他使用者和我們的權利</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-start space-x-4">
                <div className="bg-red-100 p-3 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">免責聲明</h2>
                  <div className="text-gray-700 space-y-4">
                    <p><strong>重要提醒：</strong></p>
                    <ul className="space-y-2">
                      <li>• 計算結果僅供參考，實際廣告效果可能因多種因素而有所不同</li>
                      <li>• 我們不保證使用本服務會帶來特定的商業結果</li>
                      <li>• 投資廣告存在風險，請謹慎評估您的預算能力</li>
                      <li>• 我們不對因使用本服務而產生的任何損失負責</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">智慧財產權</h2>
              <div className="text-gray-700 space-y-4">
                <p>本服務的所有內容，包括但不限於：</p>
                <ul className="space-y-2">
                  <li>• 計算工具和演算法</li>
                  <li>• 網站設計和介面</li>
                  <li>• 文字、圖片和多媒體內容</li>
                  <li>• 商標和品牌標識</li>
                </ul>
                <p>均受到智慧財產權法律保護，未經授權不得複製、修改或商業使用。</p>
              </div>
            </CardContent>
          </Card>

          {/* Service Modifications */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">服務修改</h2>
              <div className="text-gray-700 space-y-4">
                <p>我們保留隨時修改或中止服務的權利，包括：</p>
                <ul className="space-y-2">
                  <li>• 功能更新和改進</li>
                  <li>• 服務條款的變更</li>
                  <li>• 暫時或永久停止服務</li>
                </ul>
                <p>重大變更將會事先通知使用者。</p>
              </div>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">適用法律</h2>
              <div className="text-gray-700">
                <p>本服務條款受中華民國法律管轄。如有爭議，雙方同意由台灣台北地方法院為第一審管轄法院。</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">聯絡我們</h2>
              <div className="text-gray-700">
                <p className="mb-4">如果您對本服務條款有任何疑問，請聯絡我們：</p>
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