import { Button } from '@/components/ui/button';
import { useFacebookAuthUrl } from '@/hooks/useFacebookDiagnosis';
import { Facebook, Loader2 } from 'lucide-react';

interface FacebookLoginButtonProps {
  className?: string;
}

export default function FacebookLoginButton({ className }: FacebookLoginButtonProps) {
  const { refetch: getFacebookAuthUrl, isLoading } = useFacebookAuthUrl();

  const handleFacebookLogin = async () => {
    try {
      const result = await getFacebookAuthUrl();
      if (result.data && typeof result.data === 'string') {
        window.location.href = result.data;
      } else if (result.data && typeof result.data === 'object' && (result.data as any).authUrl) {
        window.location.href = (result.data as any).authUrl;
      }
    } catch (error) {
      console.error('Facebook 登入失敗:', error);
    }
  };

  return (
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
  );
}