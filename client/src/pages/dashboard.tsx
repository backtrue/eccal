import { getTranslations, type Locale } from "@/lib/i18n";
import NavigationBar from "@/components/NavigationBar";
import { useAuth } from "@/hooks/useAuth";
import { useMembershipStatus } from "@/hooks/useMembership";
import { useReferralStats } from "@/hooks/useReferralStats";
import { useCredits } from "@/hooks/useCredits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Crown, 
  Activity, 
  TrendingUp,
  Users,
  Gift,
  Link2,
  Target,
  Coins
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
  const { data: referralStats, isLoading: referralLoading } = useReferralStats();
  const { data: creditsData, isLoading: creditsLoading } = useCredits();

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

  const membershipData = membershipStatus as any;
  const isPro = membershipData?.level === "pro" && membershipData?.isActive;
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
                    {isPro && membershipData?.expiresAt && (
                      <span className="text-sm text-gray-500">
                        到期：{new Date(membershipData.expiresAt).toLocaleDateString('zh-TW')}
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

          {/* 點數餘額 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">點數餘額</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {creditsLoading ? "..." : (creditsData?.credits?.balance || 0)} 點
              </div>
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-red-500 mt-1">
                  Debug: {JSON.stringify(creditsData)}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                可用於升級會員和功能
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
              <div className="text-sm text-gray-600 mb-4 space-y-2">
                <p>分享您的專屬推薦連結，獲得以下獎勵：</p>
                <ul className="text-xs space-y-1 bg-blue-50 p-3 rounded-lg">
                  <li>• <strong>推薦人</strong>：前3人每人100點，第4人起每人50點</li>
                  <li>• <strong>被推薦人</strong>：獲得30點歡迎獎勵</li>
                  <li>• <strong>升級福利</strong>：推薦4人累積350點 = 免費Pro會員一個月</li>
                </ul>
              </div>

              {/* 推薦進度追蹤 */}
              {!referralLoading && referralStats && (
                <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-gray-800">推薦進度追蹤</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {referralStats.totalReferrals}/4 人
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">免費Pro會員進度</span>
                      <span className="font-medium">
                        {referralStats.creditsFromReferrals}/350 點
                      </span>
                    </div>
                    <Progress 
                      value={referralStats.progressToProMembership * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        {referralStats.referralsNeededForPro > 0 
                          ? `還需推薦 ${referralStats.referralsNeededForPro} 人`
                          : '已達成免費Pro會員條件！'
                        }
                      </span>
                      <span>
                        下次推薦可獲得 {referralStats.nextReferralValue} 點
                      </span>
                    </div>
                  </div>
                </div>
              )}
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