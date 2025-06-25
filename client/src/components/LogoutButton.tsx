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
      const response = await apiRequest("POST", "/api/auth/logout");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "登出成功",
        description: "您已成功登出，可以使用其他 Google 帳號重新登入",
      });
      
      // Clear all cached data
      queryClient.clear();
      
      // Refresh the page to reset authentication state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      toast({
        title: "登出失敗",
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