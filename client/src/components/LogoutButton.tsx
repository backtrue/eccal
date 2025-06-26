import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function LogoutButton() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("/api/auth/logout", "POST");
    },
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
      
      toast({
        title: "登出成功",
        description: "正在重新導向到登入頁面...",
      });
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    },
    onError: (error: any) => {
      console.error("Logout error:", error);
      toast({
        title: "登出錯誤",
        description: "登出時發生錯誤，請重新整理頁面",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={logoutMutation.isPending}
      className="text-gray-600 border-gray-300 hover:bg-gray-50"
    >
      {logoutMutation.isPending ? (
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