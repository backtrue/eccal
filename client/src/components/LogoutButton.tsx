import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function LogoutButton() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = {
    mutate: () => {
      toast({
        title: "登出功能暫時停用",
        description: "請直接重新整理頁面",
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    isPending: false
  };

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