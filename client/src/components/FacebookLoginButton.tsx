import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { Facebook, Loader2 } from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';

interface FacebookLoginButtonProps {
  className?: string;
}

export default function FacebookLoginButton({ className }: FacebookLoginButtonProps) {
  const { t } = useLocale();
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
        {isLoading ? (
          t.locale === 'zh-TW' ? '連接中...' : 
          t.locale === 'en' ? 'Connecting...' : 
          '接続中...'
        ) : (
          t.locale === 'zh-TW' ? '連接 Facebook' : 
          t.locale === 'en' ? 'Connect Facebook' : 
          'Facebook接続'
        )}
      </Button>
      <p className="text-xs text-gray-600 max-w-sm">
        {t.privacyTermsNotice.split('隱私政策').length > 1 ? (
          <>
            {t.privacyTermsNotice.split('隱私政策')[0]}
            <a 
              href="/privacy-policy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              {t.privacyPolicy}
            </a>
            {t.privacyTermsNotice.split('隱私政策')[1].split('使用條款')[0]}
            <a 
              href="/terms-of-service" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              {t.termsOfService}
            </a>
            {t.privacyTermsNotice.split('使用條款')[1]}
          </>
        ) : t.privacyTermsNotice.includes('Privacy Policy') ? (
          <>
            {t.privacyTermsNotice.split('Privacy Policy')[0]}
            <a 
              href="/en/privacy-policy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              {t.privacyPolicy}
            </a>
            {t.privacyTermsNotice.split('Privacy Policy')[1].split('Terms of Service')[0]}
            <a 
              href="/en/terms-of-service" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              {t.termsOfService}
            </a>
            {t.privacyTermsNotice.split('Terms of Service')[1]}
          </>
        ) : (
          <>
            {t.privacyTermsNotice.split('プライバシーポリシー')[0]}
            <a 
              href="/jp/privacy-policy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              {t.privacyPolicy}
            </a>
            {t.privacyTermsNotice.split('プライバシーポリシー')[1].split('利用規約')[0]}
            <a 
              href="/jp/terms-of-service" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              {t.termsOfService}
            </a>
            {t.privacyTermsNotice.split('利用規約')[1]}
          </>
        )}
      </p>
    </div>
  );
}