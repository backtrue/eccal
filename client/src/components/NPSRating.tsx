import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface NPSRatingProps {
  healthCheckId: string;
  onRatingSubmitted?: () => void;
}

export function NPSRating({ healthCheckId, onRatingSubmitted }: NPSRatingProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleRatingClick = (score: number) => {
    setRating(score);
  };

  const handleSubmit = async () => {
    if (!rating) {
      toast({
        title: '請選擇評分',
        description: '請先選擇 1-10 分的評分',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest('PUT', `/api/fbaudit/check/${healthCheckId}/rating`, {
        npsScore: rating,
        npsComment: comment.trim() || null,
      });

      setIsSubmitted(true);
      onRatingSubmitted?.();
      
      toast({
        title: '感謝您的評分！',
        description: '您的寶貴意見將幫助我們改進 AI 建議工具',
      });
    } catch (error) {
      console.error('提交評分錯誤:', error);
      toast({
        title: '提交失敗',
        description: '評分提交失敗，請稍後再試',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (score: number) => {
    if (score <= 6) return '不太可能';
    if (score <= 8) return '可能';
    return '非常可能';
  };

  const getRatingColor = (score: number) => {
    if (score <= 6) return 'text-red-600';
    if (score <= 8) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (isSubmitted) {
    return (
      <Card className="mt-6 border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-green-600 text-lg font-medium mb-2">
              ✅ 感謝您的評分！
            </div>
            <p className="text-gray-600">
              您給出了 {rating} 分，您的寶貴意見將幫助我們改進服務
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-lg text-blue-800">
          📊 請為我們的 AI 建議工具評分
        </CardTitle>
        <p className="text-sm text-blue-600">
          你覺得這個 AI 建議工具，你會推薦給你的朋友使用嗎？
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* NPS 評分按鈕 */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>一定不會</span>
              <span>一定會</span>
            </div>
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
                <Button
                  key={score}
                  variant={rating === score ? 'default' : 'outline'}
                  size="sm"
                  className={`h-12 ${
                    rating === score
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-blue-100'
                  }`}
                  onClick={() => handleRatingClick(score)}
                >
                  {score}
                </Button>
              ))}
            </div>
            {rating && (
              <div className={`text-center mt-2 font-medium ${getRatingColor(rating)}`}>
                {rating} 分 - {getRatingText(rating)}推薦
              </div>
            )}
          </div>

          {/* 意見回饋 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              意見回饋 (選填)
            </label>
            <Textarea
              placeholder="分享您使用 AI 建議工具的想法或建議..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* 提交按鈕 */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setRating(null);
                setComment('');
              }}
            >
              重新選擇
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!rating || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? '提交中...' : '提交評分'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}