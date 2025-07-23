import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Target, 
  TrendingUp, 
  BarChart3, 
  Zap, 
  Gift, 
  Star,
  Clock,
  Users,
  Award,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface RecruitmentProps {
  locale?: string;
}

export default function RecruitmentJa({ locale = 'ja' }: RecruitmentProps) {
  const painPoints = [
    "売上目標は明確だが、どれだけの「広告予算」が適切かわからない？",
    "しばらく広告を運用しているが、お金を使っても効果が良いのか悪いのかわからない？", 
    "データを見ると聞いたが、GA4とFBの管理画面には数字がたくさんあり、どれが重要なのかわからない？",
    "AIを学びたいが、市場のコースは「汎用スキル」しか教えず、「広告運用」の具体的問題を解決できない。",
    "オンラインコースを買ったが、見るのが面倒で、問題があっても聞く人がおらず、結局諦めてしまう..."
  ];

  const targetAudience = [
    {
      title: "ECブランドオーナー/マーケター",
      description: "広告予算を正確にコントロールし、すべてのお金の効率を最大化したい方。"
    },
    {
      title: "広告運用者/代理店", 
      description: "データでクライアントを説得し、より専門的な最適化アドバイスを提供したい方。"
    },
    {
      title: "コンテンツクリエイター/KOL",
      description: "自分のトラフィックと広告効果を理解し、より賢いビジネス決定をしたい方。"
    },
    {
      title: "データドリブンマーケティング愛好者",
      description: "推測をやめて、科学的方法で意思決定をしたい方。"
    }
  ];

  const notSuitableFor = [
    "まだ広告を始めておらず、基本概念について何も知らない方。",
    "「ワンクリック富裕」の魔法のボタンを探し、実際にデータ分析を学ぶ意欲がない方。",
    "自分の専門能力とビジネスへの投資について躊躇している方。"
  ];

  const faqs = [
    {
      question: "パソコンが苦手ですが、難しくないですか？",
      answer: "全く心配いりません！今回のライブの主な目的は、私が直接あなたをサポートして全ての設定を完了することです。マウスとキーボードが使えれば、ついてこられます。"
    },
    {
      question: "ライブについていけなかった場合、録画を見ることはできますか？",
      answer: "はい！すべての創始メンバーは、このライブ録画を無制限に視聴できます。"
    },
    {
      question: "「終身使用権」は本当ですか？",
      answer: "はい、これは300名の創始メンバーに対する私の約束です。将来、プラットフォームは年額サブスクリプション制になりますが、創始メンバーのみがこの資格を享受できます。"
    },
    {
      question: "購入後、どのように授業を受けて、ソフトウェアを使用しますか？",
      answer: "購入成功後、確認メールが届きます。内容にはライブコースリンク、ソフトウェア登録方法、オンラインコース交換情報が含まれています。"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* 頂部導覽 */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/jp">
              <div className="text-2xl font-bold text-blue-600">データ報告</div>
            </Link>
            <Link href="/jp/pricing">
              <Button variant="ghost" size="sm">
                プラットフォームに戻る
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* 第一部分：鉤子 - The Hook */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="mb-8">
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-4 py-2 text-lg font-medium mb-6">
              🔥 期間限定募集中
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            もう感覚で広告を運用するのはやめましょう！
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-600 font-semibold mb-8">
            これは理論を教える別のコースではありません。私はROASを向上させる実証済みのシステムを提供します。
          </p>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
              <div className="flex-shrink-0">
                <img 
                  src="/attached_assets/image_1753281122819.png" 
                  alt="邱煜庭 小黒先生" 
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-lg"
                />
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  私は邱煜庭、皆さんは「小黒先生」と呼んでくれます
                </h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  十年以上にわたり、MIS、ウェブ企画から始まり、uitox グローバルEC集団マーケティング責任者、百脳匯中国本部マーケティングマネージャーを歴任し、現在は燒賣研究所の主席コンサルタントです。「インバウンドマーケティング」を専門とし、『ネット集客力』の著者で、台湾EC業界の「肉搏戦略」専門家として知られています。
                </p>
                <p className="text-lg text-blue-600 font-semibold">
                  私は理論を教えません。すぐに実行できる実戦システムを提供します。
                </p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Facebook広告マネージャーの数字を見つめて疑問に思ったことはありませんか：「私の広告費は本当に効果的に使われているのか？」「なぜ他人の広告は利益を生むのに、私の広告はお金を燃やすだけなのか？」コースを買い、記事を読んだが、予算設定の段階になると、やはり「感覚」に頼るしかない。
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4 font-medium">
                これに共感されるなら、これは単なるライブクラスではありません。これはあなたが探し続けてきた答えです。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 第二部分：痛點 - The Pain */}
      <section className="py-16 px-4 bg-red-50 dark:bg-red-900/10">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            あなたもこれらの問題に悩まされていませんか？
          </h2>
          
          <div className="grid gap-6">
            {painPoints.map((pain, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md flex items-start gap-4">
                <div className="w-6 h-6 border-2 border-red-500 rounded flex-shrink-0 mt-1"></div>
                <p className="text-lg text-gray-700 dark:text-gray-300">{pain}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-xl text-red-600 dark:text-red-400 font-semibold">
              これらの問題で頻繁にうなずくなら、続きをお読みください...
            </p>
          </div>
        </div>
      </section>

      {/* 第三部分：解方 - The Solution */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            別の理論セットの代わりに、私は完全な「戦闘システム」を提供します
          </h2>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-8 mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                <Zap className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              私は広告主の痛点を理解しています。だから今回は、空虚な理論教育はしません。<strong>2.5時間のライブワークショップ</strong>を通じて、私の実戦で鍛えられた製品 - 十年以上の専門知識で鍛造された、EC広告主専用のSaaSプラットフォーム「データ報告」を直接ガイドします。
            </p>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 inline-block">
              <p className="text-2xl font-bold text-blue-600 mb-2">
                このシステムがあなたのAI広告戦略家になります
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 第四部分：價值展示 - The Value */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            これは単なるコースではありません - 限定「創始メンバーシップパッケージ」です
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* 價值一：軟體 */}
            <Card className="relative overflow-hidden border-2 border-blue-200 hover:border-blue-400 transition-all">
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 text-sm font-medium">
                コア価値
              </div>
              <CardHeader className="text-center pt-8">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">
                  【エンタープライズソフトウェア】「データ報告」プラットフォーム終身使用権
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  ログインが必要なプライベートソフトウェアで、GA4とFacebook APIを統合し、GPT-4で駆動されます。3つのコアエンジンが含まれています：GA予算計算機、Proキャンペーンプランナー、AI広告ヘルスチェックシステム。
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  将来の独立年額価格：¥20,000
                </p>
              </CardContent>
            </Card>

            {/* 價值二：直播 */}
            <Card className="relative overflow-hidden border-2 border-green-200 hover:border-green-400 transition-all">
              <div className="absolute top-0 right-0 bg-green-600 text-white px-3 py-1 text-sm font-medium">
                専門家指導
              </div>
              <CardHeader className="text-center pt-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">
                  【専門家ガイダンス】2.5時間ライブワークショップ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Google/Facebookアカウント統合からプラットフォームコア機能操作まで、私がオンラインで直接すべての設定をガイドします。質問があれば、ライブで質問し、即座に回答を得られます。
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  価値：¥7,500
                </p>
              </CardContent>
            </Card>

            {/* 價值三：課程 */}
            <Card className="relative overflow-hidden border-2 border-orange-200 hover:border-orange-400 transition-all">
              <div className="absolute top-0 right-0 bg-orange-600 text-white px-3 py-1 text-sm font-medium">
                完全システム
              </div>
              <CardHeader className="text-center pt-8">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">
                  【完全知識】FB広告効果攻略オンラインコース
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  ライブワークショップに加えて、小黒先生の完全な事前録画オンラインコースを取得できます。永続的な学習サポートとして、いつでも復習し、広告運用のすべての詳細を深く研究できます。
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  価格：¥6,500
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 第五部分：定價與行動呼籲 - CTA & Pricing */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-12">
            私の創始メンバーになる、一回限りの投資
          </h2>
          
          {/* 價值錨定 */}
          <div className="bg-white/10 rounded-xl p-8 mb-12 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-6">総価値計算</h3>
            <div className="space-y-3 text-lg">
              <div className="flex justify-between">
                <span>SaaSプラットフォーム終身使用権：</span>
                <span className="line-through">¥20,000+</span>
              </div>
              <div className="flex justify-between">
                <span>ライブワークショップ：</span>
                <span className="line-through">¥7,500</span>
              </div>
              <div className="flex justify-between">
                <span>完全オンラインコース：</span>
                <span className="line-through">¥6,500</span>
              </div>
              <hr className="border-white/30" />
              <div className="flex justify-between text-xl font-bold">
                <span>総価値：</span>
                <span>¥34,000以上</span>
              </div>
            </div>
          </div>
          
          {/* 震撼定價 */}
          <div className="bg-white text-gray-900 rounded-2xl p-12 mb-8 max-w-lg mx-auto shadow-2xl">
            <div className="mb-6">
              <p className="text-lg text-gray-600 mb-2">創始メンバー資格、わずか：</p>
              <div className="text-6xl font-bold text-red-600 mb-2">
                ¥ 6,900
              </div>
              <p className="text-sm text-gray-500">（世界限定300席、満席次第終了）</p>
            </div>
            
            <Link href="/jp/subscription-checkout?plan=founders&priceId=price_0Rnx9vYDQY3sAQESYJJn6TFm">
              <Button 
                size="lg" 
                className="w-full h-16 text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg transform hover:scale-105 transition-all"
              >
                <Gift className="w-6 h-6 mr-2" />
                今すぐ創始メンバー席を確保
              </Button>
            </Link>
            
            <p className="text-sm text-gray-500 mt-4">
              席数残りわずか、満席で永久閉鎖
            </p>
          </div>
          
          <div className="flex justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>30日間満足保証</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>終身無料アップデート</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>専用カスタマーサポート</span>
            </div>
          </div>
        </div>
      </section>

      {/* 第六部分：受眾輪廓 - Target Audience */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            これらのいずれかに該当すれば、このコースはあなたのために設計されています
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* 適合的人 */}
            <div>
              <h3 className="text-2xl font-bold text-green-600 mb-6 flex items-center gap-2">
                <CheckCircle className="w-8 h-8" />
                このコースに最適
              </h3>
              <div className="space-y-4">
                {targetAudience.map((audience, index) => (
                  <Card key={index} className="border-green-200 hover:border-green-400 transition-all">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {audience.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {audience.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* 不適合的人 */}
            <div>
              <h3 className="text-2xl font-bold text-red-600 mb-6 flex items-center gap-2">
                <XCircle className="w-8 h-8" />
                このコースに適さない方
              </h3>
              <div className="space-y-4">
                {notSuitableFor.map((item, index) => (
                  <Card key={index} className="border-red-200 hover:border-red-400 transition-all">
                    <CardContent className="p-4">
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {item}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 第七部分：FAQ */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            よくある質問
          </h2>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Q: {faq.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    A: {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 最終行動呼籲 */}
      <section className="py-16 px-4 bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            この機会を逃してはいけません
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            300人の創始メンバー席 - 満席になれば、この価格は二度と現れません
          </p>
          
          <Link href="/jp/subscription-checkout?plan=founders&priceId=price_0Rnx9vYDQY3sAQESYJJn6TFm">
            <Button 
              size="lg" 
              className="h-16 px-12 text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg transform hover:scale-105 transition-all"
            >
              最後のチャンス - 今すぐ創始メンバーに参加
              <ChevronRight className="w-6 h-6 ml-2" />
            </Button>
          </Link>
          
          <p className="text-sm text-gray-400 mt-6">
            ボタンをクリックして安全な支払いページへ
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="mb-4">
            <div className="text-2xl font-bold text-blue-400 mb-2">データ報告</div>
            <p className="text-gray-400">プロフェッショナルEC広告分析プラットフォーム</p>
          </div>
          <div className="text-sm text-gray-500">
            <p>&copy; 2025 煜言顧問有限公司(TW) | 燈言顧問株式会社(JP). All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}