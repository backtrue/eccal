import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Coins, 
  Users, 
  Share2, 
  TrendingUp, 
  TrendingDown,
  Copy,
  CheckCircle,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { getTranslations, type Locale } from "@/lib/i18n";
import { queryClient } from "@/lib/queryClient";

interface DashboardProps {
  locale: Locale;
}

interface CreditData {
  credits: {
    balance: number;
    totalEarned: number;
    totalSpent: number;
  };
  transactions: Array<{
    id: string;
    type: "earn" | "spend";
    amount: number;
    source: string;
    description: string;
    createdAt: string;
    referralUserId?: string;
  }>;
}

interface ReferralData {
  id: string;
  referredUserId: string;
  referralCode: string;
  creditAwarded: boolean;
  createdAt: string;
  referredUser: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
}

export default function Dashboard({ locale }: DashboardProps) {
  const t = getTranslations(locale);
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: creditData, isLoading: creditsLoading } = useQuery({
    queryKey: ['/api/credits'],
  });

  const { data: referralCode, isLoading: codeLoading } = useQuery({
    queryKey: ['/api/referral/code'],
  });

  const { data: referrals, isLoading: referralsLoading } = useQuery({
    queryKey: ['/api/referrals'],
  });

  const credits = creditData as CreditData | undefined;
  const referralList = referrals as ReferralData[] | undefined;

  const copyReferralLink = async (code: string) => {
    const baseUrl = window.location.origin;
    const referralLink = `${baseUrl}?ref=${code}`;
    
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopiedCode(code);
      toast({
        title: "連結已複製",
        description: "推薦連結已複製到剪貼簿",
      });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast({
        title: "複製失敗",
        description: "請手動複製推薦連結",
        variant: "destructive",
      });
    }
  };

  const shareToSocial = (platform: string, code: string) => {
    const baseUrl = window.location.origin;
    const referralLink = `${baseUrl}?ref=${code}`;
    const message = `想知道廣告預算怎麼抓？試試這個免費的 FB、IG 廣告預算計算機！${referralLink}`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
        break;
      case 'line':
        shareUrl = `https://line.me/R/msg/text/?${encodeURIComponent(message)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (creditsLoading || codeLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">會員後台</h1>
          <p className="text-gray-600 mt-2">管理您的 Credit 和推薦獎勵</p>
        </div>

        {/* Credit Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Coins className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">可用 Credits</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {credits?.credits.balance || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">總獲得</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {credits?.credits.totalEarned || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">總消耗</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {credits?.credits.totalSpent || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">Credit 記錄</TabsTrigger>
            <TabsTrigger value="referral">推薦賺取</TabsTrigger>
            <TabsTrigger value="friends">推薦好友</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Credit 交易記錄</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {credits?.transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          transaction.type === 'earn' 
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {transaction.type === 'earn' ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(transaction.createdAt)} • {transaction.source}
                          </p>
                        </div>
                      </div>
                      <div className={`font-bold ${
                        transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'earn' ? '+' : '-'}{transaction.amount} Credits
                      </div>
                    </div>
                  ))}
                  
                  {(!credits?.transactions || credits.transactions.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>尚無交易記錄</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referral">
            <Card>
              <CardHeader>
                <CardTitle>推薦連結</CardTitle>
                <p className="text-sm text-gray-600">
                  {t.referralDescription}
                </p>
              </CardHeader>
              <CardContent>
                {referralCode && (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">您的推薦連結：</p>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 p-2 bg-white rounded border text-sm">
                          {window.location.origin}?ref={referralCode.referralCode}
                        </code>
                        <Button
                          size="sm"
                          onClick={() => copyReferralLink(referralCode.referralCode)}
                          className="flex items-center space-x-1"
                        >
                          {copiedCode === referralCode.referralCode ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                          <span>{copiedCode === referralCode.referralCode ? '已複製' : '複製'}</span>
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        variant="outline"
                        onClick={() => shareToSocial('facebook', referralCode.referralCode)}
                        className="flex items-center justify-center space-x-2"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>分享到 Facebook</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => shareToSocial('line', referralCode.referralCode)}
                        className="flex items-center justify-center space-x-2"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>分享到 LINE</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => shareToSocial('twitter', referralCode.referralCode)}
                        className="flex items-center justify-center space-x-2"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>分享到 Twitter</span>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="friends">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>推薦好友</span>
                </CardTitle>
                <p className="text-sm text-gray-600">
                  查看透過您的推薦連結加入的朋友們
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {referralList?.map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {referral.referredUser?.firstName || referral.referredUser?.lastName
                              ? `${referral.referredUser.firstName || ''} ${referral.referredUser.lastName || ''}`.trim()
                              : referral.referredUser?.email || '匿名用戶'}
                          </p>
                          <p className="text-sm text-gray-500">
                            加入時間：{formatDate(referral.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={referral.creditAwarded ? "default" : "secondary"}>
                          {referral.creditAwarded ? '已獲得 1 Credit' : '處理中'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  
                  {(!referralList || referralList.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>還沒有朋友透過您的連結加入</p>
                      <p className="text-sm mt-2">快去分享您的推薦連結吧！</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}