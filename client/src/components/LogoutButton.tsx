import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LogoutButton() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    
    // Clear all cached queries first
    queryClient.clear();
    
    toast({
      title: "登出中...",
      description: "正在切換帳號",
    });
    
    // Redirect directly to the Google OAuth logout endpoint
    // This will handle the logout process and redirect back to home
    setTimeout(() => {
      window.location.href = "/api/auth/logout";
    }, 500);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="text-gray-600 border-gray-300 hover:bg-gray-50"
    >
      {isLoggingOut ? (
        <>
          <LogOut className="w-4 h-4 mr-1 animate-spin" />
          登出中...
        </>
      ) : (
        <>
          <LogOut className="w-4 h-4 mr-1" />
          切換帳號
        </>
      )}
    </Button>
  );
}