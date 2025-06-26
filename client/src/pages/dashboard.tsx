import { getTranslations, type Locale } from "@/lib/i18n";
import NavigationBar from "@/components/NavigationBar";
import { useAuth } from "@/hooks/useAuth";
import { useMembershipStatus } from "@/hooks/useMembership";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Crown, 
  Activity, 
  TrendingUp,
  Users,
  Gift,
  Link2
} from "lucide-react";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import MembershipUpgrade from "@/components/MembershipUpgrade";

interface DashboardProps {
  locale: Locale;
}

export default function Dashboard({ locale }: DashboardProps) {
  const t = getTranslations(locale);
  const { user, isAuthenticated, isLoading } = useAuth();
  const { data: membershipStatus, isLoading: membershipLoading } = useMembershipStatus();

  if (isLoading || membershipLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar locale={locale} />
        <div className="container mx-auto p-6 max-w-6xl">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">載入中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar locale={locale} />
        <div className="container mx-auto p-6 max-w-6xl">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold mb-6">會員中心</h1>
            <p className="text-gray-600 mb-8">請先登入 Google 帳號以存取會員功能</p>
            <GoogleLoginButton />
          </div>
        </div>
      </div>
    );
  }

  const isPro = membershipStatus && membershipStatus.level === "pro" && membershipStatus.isActive;
  const referralLink = `${window.location.origin}?ref=${(user as any)?.id || 'user'}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar locale={locale} />
      <div className="container mx-auto p-6 max-w-6xl">
        {/* 用戶資訊卡片 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {(user as any)?.firstName || (user as any)?.email || "用戶"}
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={isPro ? "default" : "secondary"} className="flex items-center gap-1">
                      {isPro && <Crown className="w-3 h-3" />}
                      {isPro ? "PRO 會員" : "免費會員"}
                    </Badge>
                    {isPro && membershipStatus?.expiresAt && (
                      <span className="text-sm text-gray-500">
                        到期：{new Date(membershipStatus.expiresAt).toLocaleDateString('zh-TW')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {!isPro && <MembershipUpgrade />}
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 會員狀態 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">會員狀態</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isPro ? "PRO" : "免費"}
              </div>
              <p className="text-xs text-muted-foreground">
                {isPro ? "享有完整功能" : "升級解鎖更多功能"}
              </p>
            </CardContent>
          </Card>

          {/* 活動規劃器 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">活動規劃器</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isPro ? "無限制" : "3 次"}
              </div>
              <p className="text-xs text-muted-foreground">
                {isPro ? "PRO 會員專享" : "免費用戶限制"}
              </p>
            </CardContent>
          </Card>

          {/* 計算工具 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">計算工具</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                無限制
              </div>
              <p className="text-xs text-muted-foreground">
                廣告預算計算機
              </p>
            </CardContent>
          </Card>

          {/* 推薦連結 */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                推薦好友獲得獎勵
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                分享您的專屬推薦連結，好友註冊後您和好友都可獲得 5 點數獎勵
              </p>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-3 bg-gray-100 rounded-lg text-sm font-mono">
                  {referralLink}
                </div>
                <Button
                  onClick={() => navigator.clipboard.writeText(referralLink)}
                  variant="outline"
                  size="sm"
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  複製
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}