import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { Facebook, Loader2 } from 'lucide-react';

interface FacebookLoginButtonProps {
  className?: string;
}

export default function FacebookLoginButton({ className }: FacebookLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFacebookLogin = () => {
    setIsLoading(true);
    // 直接重定向到 Facebook Auth URL 端點
    window.location.href = '/api/diagnosis/facebook-auth-url';
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleFacebookLogin}
        disabled={isLoading}
        className={`bg-[#1877F2] hover:bg-[#166FE5] text-white ${className}`}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Facebook className="mr-2 h-4 w-4" />
        )}
        {isLoading ? '連接中...' : '連接 Facebook'}
      </Button>
      <p className="text-xs text-gray-600 max-w-sm">
        點擊上方按鈕即表示您同意我們的{' '}
        <a 
          href="/privacy-policy" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 underline"
        >
          隱私政策
        </a>
        {' '}並授權我們存取您的 Facebook 廣告資料以提供分析服務。
      </p>
    </div>
  );
}