import { ReactNode } from "react";
import { useProtectedFeature } from "@/hooks/useMembership";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import MembershipUpgrade from "./MembershipUpgrade";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ProtectedFeatureProps {
  children: ReactNode;
  requiredLevel?: "free" | "pro";
  featureName?: string;
  description?: string;
}

export default function ProtectedFeature({ 
  children, 
  requiredLevel = "pro", 
  featureName = "此功能",
  description = "需要 Pro 會員才能使用此功能"
}: ProtectedFeatureProps) {
  const { hasAccess, isLoading, requiresUpgrade } = useProtectedFeature(requiredLevel);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (requiresUpgrade) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-yellow-600" />
            需要 {requiredLevel === "pro" ? "Pro" : "Free"} 會員
          </CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white">
                <Crown className="w-4 h-4" />
                升級至 Pro 會員
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>選擇會員方案</DialogTitle>
              </DialogHeader>
              <MembershipUpgrade />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  return null;
}