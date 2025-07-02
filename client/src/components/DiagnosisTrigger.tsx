import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Activity, Facebook, Link, Zap } from "lucide-react";
import { useLocation } from "wouter";

interface DiagnosisTriggerProps {
  calculatorResults: {
    targetRevenue: number;
    targetAov: number;
    targetConversionRate: number;
    cpc: number;
    dailyTraffic: number;
    dailyBudget: number;
  };
}

export default function DiagnosisTrigger({ calculatorResults }: DiagnosisTriggerProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [campaignId, setCampaignId] = useState("");
  const [showCampaignInput, setShowCampaignInput] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleConnectMeta = async () => {
    if (!isAuthenticated) {
      toast({
        title: "需要登入",
        description: "請先登入 Google 帳戶以使用診斷功能",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      // 檢查 Facebook API 配置
      const configResponse = await fetch('/api/diagnosis/check-facebook-config');
      const configData = await configResponse.json();
      
      if (!configData.success) {
        throw new Error(configData.message || 'Facebook API 配置不完整');
      }

      await apiRequest('POST', '/api/diagnosis/connect-meta', {});

      toast({
        title: "連接成功！",
        description: "Facebook 廣告帳戶已成功連接",
      });

      setShowCampaignInput(true);
    } catch (error: any) {
      console.error('Meta連接錯誤:', error);
      toast({
        title: "連接失敗",
        description: error.message || "無法連接 Facebook 廣告帳戶",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleStartDiagnosis = async () => {
    if (!campaignId.trim()) {
      toast({
        title: "請輸入活動 ID",
        description: "需要指定要診斷的 Facebook 廣告活動",
        variant: "destructive",
      });
      return;
    }

    setIsDiagnosing(true);
    try {
      const response = await apiRequest('POST', '/api/diagnosis/analyze', {
        campaignId: campaignId.trim(),
        targetRevenue: calculatorResults.targetRevenue,
        targetAov: calculatorResults.targetAov,
        targetConversionRate: calculatorResults.targetConversionRate,
        cpc: calculatorResults.cpc
      });

      toast({
        title: "診斷已開始！",
        description: "AI 正在分析您的廣告成效，即將跳轉到報告頁面",
      });

      // 跳轉到診斷報告頁面
      setTimeout(() => {
        navigate(`/diagnosis-report/${(response as any).reportId}`);
      }, 2000);

    } catch (error: any) {
      console.error('診斷啟動錯誤:', error);
      toast({
        title: "診斷失敗",
        description: error.message || "無法啟動廣告診斷",
        variant: "destructive",
      });
    } finally {
      setIsDiagnosing(false);
    }
  };

  return (
    <Card className="border-gradient-to-r from-blue-100 to-purple-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          Facebook 廣告成效健診
        </CardTitle>
        <CardDescription>
          將您的商業目標與實際廣告成效進行 AI 智能比較，獲得專業優化建議
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isAuthenticated && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ 需要先登入 Google 帳戶才能使用廣告健診功能
            </p>
          </div>
        )}

        {!showCampaignInput ? (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="font-medium">您的目標設定</Label>
                <div className="mt-2 space-y-1 text-gray-600">
                  <p>月營收目標: NT${calculatorResults.targetRevenue.toLocaleString()}</p>
                  <p>平均客單價: NT${calculatorResults.targetAov}</p>
                  <p>目標轉換率: {calculatorResults.targetConversionRate}%</p>
                  <p>建議日預算: NT${calculatorResults.dailyBudget.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <Label className="font-medium">健診功能特色</Label>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>✅ 流量與預算達成率分析</p>
                  <p>✅ 廣告漏斗結構診斷</p>
                  <p>✅ 電商轉換瓶頸識別</p>
                  <p>✅ AI 多情境優化建議</p>
                </div>
              </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={!isAuthenticated}
                >
                  <Facebook className="h-4 w-4 mr-2" />
                  連結 Facebook，立即健診
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>連接 Facebook 廣告帳戶</DialogTitle>
                  <DialogDescription>
                    授權存取您的 Facebook 廣告帳戶以進行成效分析
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      🔒 我們將安全地存取您的廣告數據進行分析，不會修改任何廣告設定
                    </p>
                  </div>
                  <Button 
                    onClick={handleConnectMeta}
                    disabled={isConnecting}
                    className="w-full"
                  >
                    {isConnecting ? (
                      <>正在連接...</>
                    ) : (
                      <>
                        <Link className="h-4 w-4 mr-2" />
                        授權並連接
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ Facebook 廣告帳戶已連接成功
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaignId">廣告活動 ID</Label>
              <Input
                id="campaignId"
                placeholder="請輸入要診斷的廣告活動 ID (例如: 23851234567890123)"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                💡 可在 Facebook 廣告管理員中找到活動 ID
              </p>
            </div>

            <Button 
              onClick={handleStartDiagnosis}
              disabled={isDiagnosing || !campaignId.trim()}
              className="w-full"
            >
              {isDiagnosing ? (
                <>AI 分析中...</>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  開始智能健診
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}