import { Button } from "@/components/ui/button";
import { Chrome } from "lucide-react";

interface GoogleLoginButtonProps {
  className?: string;
}

export default function GoogleLoginButton({ className }: GoogleLoginButtonProps) {
  const handleGoogleLogin = () => {
    // Get current page for return redirect
    const currentPage = window.location.pathname + window.location.search;
    // Pass returnTo as URL parameter to the OAuth endpoint
    const returnToParam = encodeURIComponent(currentPage);
    window.location.href = `/api/auth/google?returnTo=${returnToParam}`;
  };

  return (
    <Button 
      onClick={handleGoogleLogin}
      variant="outline"
      className={`flex items-center space-x-2 ${className}`}
    >
      <Chrome className="w-4 h-4" />
      <span>使用 Google 登入</span>
    </Button>
  );
}