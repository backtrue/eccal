
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import NavigationBar from '@/components/NavigationBar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Star, MessageSquare, Calendar, User, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface NPSRating {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  npsScore: number;
  npsComment: string | null;
  npsSubmittedAt: string;
  adAccountName: string;
  industryType: string;
}

interface NPSStats {
  totalRatings: number;
  averageScore: number;
  promoters: number;
  passives: number;
  detractors: number;
  npsScore: number;
}

export default function NPSRatingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ratings, setRatings] = useState<NPSRating[]>([]);
  const [stats, setStats] = useState<NPSStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNPSData();
  }, []);

  const fetchNPSData = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('GET', '/api/bdmin/nps-ratings');
      setRatings(data.ratings || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('獲取 NPS 數據失敗:', error);
      toast({
        title: '載入失敗',
        description: '無法載入 NPS 評分數據',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (score: number) => {
    if (score <= 6) return 'bg-red-100 text-red-800';
    if (score <= 8) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getRatingLabel = (score: number) => {
    if (score <= 6) return '批評者';
    if (score <= 8) return '中立者';
    return '推薦者';
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">權限不足</h1>
            <p className="text-gray-600">您需要管理員權限才能查看此頁面</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">NPS 評分管理</h1>
          <p className="text-gray-600">用戶對 AI 建議工具的滿意度評分</p>
        </div>

        {/* 統計概覽 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">總評分數</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalRatings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">平均分數</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">推</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">推薦者 (9-10)</p>
                    <p className="text-2xl font-bold text-green-600">{stats.promoters}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 font-bold">中</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">中立者 (7-8)</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.passives}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold">批</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">批評者 (1-6)</p>
                    <p className="text-2xl font-bold text-red-600">{stats.detractors}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* NPS 分數卡片 */}
        {stats && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Net Promoter Score (NPS)</h3>
                <div className={`text-4xl font-bold ${stats.npsScore >= 50 ? 'text-green-600' : stats.npsScore >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {stats.npsScore.toFixed(0)}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  NPS = (推薦者% - 批評者%) = ({((stats.promoters / stats.totalRatings) * 100).toFixed(1)}% - {((stats.detractors / stats.totalRatings) * 100).toFixed(1)}%)
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 評分列表 */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>詳細評分記錄</CardTitle>
              <Button onClick={fetchNPSData} disabled={loading}>
                {loading ? '載入中...' : '重新載入'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">載入中...</p>
              </div>
            ) : ratings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">尚無 NPS 評分記錄</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>用戶</TableHead>
                      <TableHead>評分</TableHead>
                      <TableHead>分類</TableHead>
                      <TableHead>廣告帳戶</TableHead>
                      <TableHead>產業類型</TableHead>
                      <TableHead>評價內容</TableHead>
                      <TableHead>提交時間</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ratings.map((rating) => (
                      <TableRow key={rating.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <p className="font-medium">{rating.userName || '未知用戶'}</p>
                              <p className="text-sm text-gray-500">{rating.userEmail}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="text-lg font-bold text-blue-600 mr-2">{rating.npsScore}</span>
                            <div className="flex">
                              {Array.from({ length: 10 }, (_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < rating.npsScore ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRatingColor(rating.npsScore)}>
                            {getRatingLabel(rating.npsScore)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{rating.adAccountName}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{rating.industryType}</Badge>
                        </TableCell>
                        <TableCell>
                          {rating.npsComment ? (
                            <div className="flex items-start">
                              <MessageSquare className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                              <p className="text-sm max-w-xs truncate" title={rating.npsComment}>
                                {rating.npsComment}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">無評價</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm">
                              {format(new Date(rating.npsSubmittedAt), 'yyyy/MM/dd HH:mm', { locale: zhTW })}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
