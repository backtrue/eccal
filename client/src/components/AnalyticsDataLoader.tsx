import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useAnalyticsProperties, useAnalyticsData, useUserMetrics } from "@/hooks/useAnalyticsData";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Download, AlertCircle } from "lucide-react";
import type { AnalyticsProperty } from "@/hooks/useAnalyticsData";

interface AnalyticsDataLoaderProps {
  onDataLoaded: (data: { averageOrderValue: number; conversionRate: number }) => void;
}

export default function AnalyticsDataLoader({ onDataLoaded }: AnalyticsDataLoaderProps) {
  const { isAuthenticated } = useAuth();
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  
  const propertiesQuery = useAnalyticsProperties();
  const analyticsDataMutation = useAnalyticsData();
  const userMetricsQuery = useUserMetrics();

  // Fetch properties when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      propertiesQuery.refetch();
      userMetricsQuery.refetch();
    }
  }, [isAuthenticated]);

  // Auto-fill from saved metrics if available
  useEffect(() => {
    if (userMetricsQuery.data && !analyticsDataMutation.isSuccess) {
      const metrics = userMetricsQuery.data;
      onDataLoaded({
        averageOrderValue: parseFloat(metrics.averageOrderValue || "0"),
        conversionRate: parseFloat(metrics.conversionRate || "0") * 100, // Convert to percentage
      });
    }
  }, [userMetricsQuery.data, onDataLoaded, analyticsDataMutation.isSuccess]);

  const handleFetchData = async () => {
    if (!selectedProperty) return;
    
    try {
      const data = await analyticsDataMutation.mutateAsync(selectedProperty);
      onDataLoaded({
        averageOrderValue: data.averageOrderValue,
        conversionRate: data.conversionRate,
      });
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const properties: AnalyticsProperty[] = propertiesQuery.data || [];

  return (
    <Card className="mb-6 border-green-200 bg-green-50">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="bg-green-100 p-2 rounded-lg">
            <Download className="text-green-600 w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-900 mb-2">從 Google Analytics 自動取得數據</h3>
            <p className="text-sm text-green-700 mb-4">
              自動取得過去 28 天的平均客單價和轉換率數據
            </p>

            {propertiesQuery.isLoading && (
              <div className="flex items-center space-x-2 text-green-700">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">正在載入 Google Analytics 資源...</span>
              </div>
            )}

            {propertiesQuery.error && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">無法載入 Google Analytics 資源，請確認您已授權存取權限</span>
              </div>
            )}

            {properties.length > 0 && (
              <div className="space-y-3">
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="選擇 Google Analytics 資源" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.displayName} ({property.accountName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleFetchData}
                  disabled={!selectedProperty || analyticsDataMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {analyticsDataMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      正在取得數據...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      取得 Analytics 數據
                    </>
                  )}
                </Button>
              </div>
            )}

            {analyticsDataMutation.isError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">取得數據失敗，請確認該資源有電商追蹤數據</span>
                </div>
              </div>
            )}

            {analyticsDataMutation.isSuccess && (
              <div className="mt-3 p-3 bg-green-100 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  ✓ 成功取得數據並已自動填入計算機欄位
                </p>
              </div>
            )}

            {userMetricsQuery.data && !analyticsDataMutation.isSuccess && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  ℹ️ 已載入您上次儲存的 Analytics 數據
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}