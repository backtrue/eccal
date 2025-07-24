import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ADMIN_EMAILS = ['backtrue@gmail.com', 'backtrue@seo-tw.org'];

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { user, isLoading, isAuthenticated, checkAuth } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Debug information
    console.log('Admin Route Debug:', {
      isLoading,
      isAuthenticated,
      user,
      userEmail: user?.email,
      isAdmin: user ? ADMIN_EMAILS.includes(user.email || '') : false
    });

    // 如果尚未檢查認證狀態，先觸發檢查
    if (!isLoading && !isAuthenticated && !user) {
      console.log('Admin route: Triggering auth check...');
      checkAuth();
      return;
    }

    if (!isLoading) {
      if (!isAuthenticated) {
        console.log('Redirecting to login - not authenticated');
        window.location.href = '/api/auth/google?returnTo=/bdmin';
        return;
      }

      if (user && !ADMIN_EMAILS.includes(user.email || '')) {
        console.log('Redirecting to home - not admin:', user.email);
        setLocation('/');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, setLocation, checkAuth]);

  // 載入中顯示載入畫面
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">驗證管理員權限中...</p>
        </div>
      </div>
    );
  }

  // 未登入或非管理員，顯示錯誤訊息
  if (!isAuthenticated || !user || !ADMIN_EMAILS.includes(user.email || '')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">存取被拒絕</h1>
          <p className="text-gray-600 mb-4">您沒有權限訪問此管理頁面</p>
          <button
            onClick={() => setLocation('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            返回首頁
          </button>
        </div>
      </div>
    );
  }

  // 管理員權限驗證通過，顯示內容
  return <>{children}</>;
}