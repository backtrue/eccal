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