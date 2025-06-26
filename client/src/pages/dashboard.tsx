import { getTranslations, type Locale } from "@/lib/i18n";

interface DashboardProps {
  locale: Locale;
}

export default function Dashboard({ locale }: DashboardProps) {
  const t = getTranslations(locale);
  
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-6">會員中心</h1>
        <p className="text-gray-600 mb-8">請先登入 Google 帳號以存取會員功能</p>
        <a 
          href="/api/auth/google" 
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t.loginWithGoogle}
        </a>
      </div>
    </div>
  );
}