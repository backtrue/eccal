import { Button } from "@/components/ui/button";
import { Chrome } from "lucide-react";
import type { Locale } from "@/lib/i18n";

interface GoogleLoginButtonProps {
  locale: Locale;
  returnTo?: string;
}

export default function GoogleLoginButton({ locale, returnTo }: GoogleLoginButtonProps) {
  const handleGoogleLogin = () => {
    const params = new URLSearchParams();
    if (returnTo) {
      params.set('returnTo', returnTo);
    }
    
    window.location.href = `/api/auth/google${params.toString() ? '?' + params.toString() : ''}`;
  };

  return (
    <Button onClick={handleGoogleLogin} variant="outline" className="w-full">
      <Chrome className="mr-2 h-4 w-4" />
      {locale === 'zh-TW' 
        ? 'Google 登入' 
        : locale === 'en' 
        ? 'Login with Google' 
        : 'Googleでログイン'}
    </Button>
  );
}