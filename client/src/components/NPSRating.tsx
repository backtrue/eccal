import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { getTranslations, type Locale } from '@/lib/i18n';

interface NPSRatingProps {
  healthCheckId: string;
  locale: Locale;
  onRatingSubmitted?: () => void;
}

export function NPSRating({ healthCheckId, locale, onRatingSubmitted }: NPSRatingProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const t = getTranslations(locale);

  const handleRatingClick = (score: number) => {
    setRating(score);
  };

  const handleSubmit = async () => {
    if (!rating) {
      toast({
        title: locale === 'zh-TW' ? '請選擇評分' : locale === 'en' ? 'Please select a rating' : '評価を選択してください',
        description: locale === 'zh-TW' ? '請先選擇 1-10 分的評分' : locale === 'en' ? 'Please select a rating from 1-10' : '1-10の評価を選択してください',
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
        title: t.thankYouMessage.split('！')[0] + '！',
        description: locale === 'zh-TW' ? '您的寶貴意見將幫助我們改進 AI 建議工具' : locale === 'en' ? 'Your valuable feedback will help us improve the AI recommendation tool' : 'あなたの貴重なフィードバックは、AI推薦ツールの改善に役立ちます',
      });
    } catch (error) {
      console.error('提交評分錯誤:', error);
      toast({
        title: locale === 'zh-TW' ? '提交失敗' : locale === 'en' ? 'Submission Failed' : '送信失敗',
        description: locale === 'zh-TW' ? '評分提交失敗，請稍後再試' : locale === 'en' ? 'Rating submission failed, please try again later' : '評価の送信に失敗しました。後でもう一度お試しください',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (score: number) => {
    if (score <= 6) return locale === 'zh-TW' ? '不太可能' : locale === 'en' ? 'Unlikely' : 'あまり可能性がない';
    if (score <= 8) return locale === 'zh-TW' ? '可能' : locale === 'en' ? 'Maybe' : 'たぶん';
    return locale === 'zh-TW' ? '非常可能' : locale === 'en' ? 'Very likely' : '非常に可能性が高い';
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
              ✅ {t.thankYouMessage.split('！')[0]}！
            </div>
            <p className="text-gray-600">
              {locale === 'zh-TW' ? `您給出了 ${rating} 分，您的寶貴意見將幫助我們改進服務` : locale === 'en' ? `You rated ${rating} points. Your valuable feedback will help us improve our service` : `${rating}点の評価をいただきました。あなたの貴重なフィードバックは、私たちのサービス向上に役立ちます`}
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
          📊 {locale === 'zh-TW' ? '請為我們的 AI 建議工具評分' : locale === 'en' ? 'Please rate our AI recommendation tool' : '私たちのAI推薦ツールを評価してください'}
        </CardTitle>
        <p className="text-sm text-blue-600">
          {t.ratingQuestion}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* NPS 評分按鈕 */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>{t.ratingLow}</span>
              <span>{t.ratingHigh}</span>
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
              {locale === 'zh-TW' ? '意見回饋 (選填)' : locale === 'en' ? 'Feedback (Optional)' : 'フィードバック（任意）'}
            </label>
            <Textarea
              placeholder={t.commentPlaceholder}
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
              {locale === 'zh-TW' ? '重新選擇' : locale === 'en' ? 'Reset' : 'リセット'}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!rating || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (locale === 'zh-TW' ? '提交中...' : locale === 'en' ? 'Submitting...' : '送信中...') : t.submitRating}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}