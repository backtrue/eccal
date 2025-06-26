import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUpgradeToPro, useMembershipStatus } from "@/hooks/useMembership";
import { useToast } from "@/hooks/use-toast";
import { Crown, Star, Zap } from "lucide-react";

interface MembershipUpgradeProps {
  onUpgradeSuccess?: () => void;
}

export default function MembershipUpgrade({ onUpgradeSuccess }: MembershipUpgradeProps) {
  const { data: membership, isLoading: membershipLoading } = useMembershipStatus();
  const upgradeMutation = useUpgradeToPro();
  const { toast } = useToast();

  const handleUpgrade = async () => {
    try {
      await upgradeMutation.mutateAsync(30);
      toast({
        title: "升級成功！",
        description: "歡迎成為 Pro 會員，現在可以使用所有進階功能！",
      });
      onUpgradeSuccess?.();
    } catch (error: any) {
      toast({
        title: "升級失敗",
        description: error.message || "升級過程中發生錯誤，請稍後再試",
        variant: "destructive",
      });
    }
  };

  if (membershipLoading) {
    return <div>載入中...</div>;
  }

  const isPro = membership?.level === "pro" && membership?.isActive;
  const upgradePrice = 350;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Free Plan */}
      <Card className="relative">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-500" />
              Free 會員
            </CardTitle>
            {membership?.level === "free" && (
              <Badge variant="secondary">目前方案</Badge>
            )}
          </div>
          <CardDescription>完全免費使用基本功能</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-2xl font-bold">免費</div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                ✅ 廣告預算計算器
              </li>
              <li className="flex items-center gap-2">
                ✅ Google Analytics 整合
              </li>
              <li className="flex items-center gap-2">
                ✅ 積分系統
              </li>
              <li className="flex items-center gap-2">
                ✅ 推薦獎勵
              </li>
              <li className="flex items-center gap-2">
                ✅ 多語言支援
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Pro Plan */}
      <Card className={`relative ${isPro ? 'ring-2 ring-yellow-500' : 'border-yellow-200'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Pro 會員
            </CardTitle>
            {isPro && (
              <Badge className="bg-yellow-500 text-white">目前方案</Badge>
            )}
          </div>
          <CardDescription>
            {isPro 
              ? `有效期至 ${new Date(membership?.expiresAt!).toLocaleDateString()}`
              : "解鎖所有進階功能"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{upgradePrice} 積分</span>
              <span className="text-sm text-gray-500">/30天</span>
            </div>
            
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                ✅ 包含所有 Free 功能
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                進階分析報表（即將推出）
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                自動化廣告建議（即將推出）
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                競爭對手分析（即將推出）
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                優先客服支援
              </li>
            </ul>

            {!isPro && (
              <Button 
                onClick={handleUpgrade}
                disabled={upgradeMutation.isPending}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                {upgradeMutation.isPending ? "升級中..." : `升級至 Pro (${upgradePrice} 積分)`}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}