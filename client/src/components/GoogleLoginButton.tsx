import { Button } from "@/components/ui/button";
import { Chrome } from "lucide-react";

interface GoogleLoginButtonProps {
  className?: string;
}

export default function GoogleLoginButton({ className }: GoogleLoginButtonProps) {
  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
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