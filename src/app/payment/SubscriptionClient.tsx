'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Crown,
  Check,
  CreditCard,
  Shield,
  Zap,
  Star,
  Loader2,
  AlertTriangle,
  Construction,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

interface Plan {
  id: string;
  name: string;
  price: string;
  priceId: string;
  interval: string;
  features: string[];
  popular?: boolean;
  color: string;
  icon: typeof Star;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'フリー',
    price: '¥0',
    priceId: '',
    interval: '永久無料',
    features: ['全カテゴリのクイズに挑戦', '解答履歴の閲覧', 'ランダムクイズ', 'キーワード検索'],
    color: 'border-gray-200 dark:border-gray-700',
    icon: Star,
  },
  {
    id: 'pro-monthly',
    name: 'Pro（月額）',
    price: '¥980',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID ?? '',
    interval: '月',
    features: [
      'フリープランの全機能',
      '詳細な学習分析',
      '広告の非表示',
      '優先サポート',
      'AI による弱点分析',
    ],
    popular: true,
    color: 'border-blue-400 dark:border-blue-500',
    icon: Zap,
  },
  {
    id: 'pro-yearly',
    name: 'Pro（年額）',
    price: '¥7,980',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID ?? '',
    interval: '年',
    features: [
      'フリープランの全機能',
      '詳細な学習分析',
      '広告の非表示',
      '優先サポート',
      'AI による弱点分析',
      '2ヶ月分お得',
    ],
    color: 'border-violet-400 dark:border-violet-500',
    icon: Crown,
  },
];

export default function SubscriptionClient() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const handleSubscribe = async (plan: Plan) => {
    setError(null);

    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    if (!plan.priceId) {
      setError('現在このプランはご利用いただけません。しばらくしてから再度お試しください。');
      return;
    }

    try {
      setLoadingPlan(plan.id);
      const res = await api.post('/api/payment/subscription', {
        priceId: plan.priceId,
      });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'サブスクリプションの開始に失敗しました';
      setError(msg);
    } finally {
      setLoadingPlan(null);
    }
  };

  const handlePortal = async () => {
    setError(null);
    try {
      setPortalLoading(true);
      const res = await api.post('/api/payment/portal');
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'ポータルの表示に失敗しました';
      setError(msg);
    } finally {
      setPortalLoading(false);
    }
  };

  const [stripeActive, setStripeActive] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'stripeActive') {
      // sessionStorageなのでタブ閉じたら無効化される
      sessionStorage.setItem('stripeActive', '1');
    }
    setStripeActive(sessionStorage.getItem('stripeActive') === '1');
  }, []);

  const isPreparingBanner = !stripeActive;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 md:py-16">
      {/* 準備中バナー */}
      {isPreparingBanner && (
        <div className="mb-8 rounded-md border-2 border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/30 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Construction className="size-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800 dark:text-amber-300 mb-1">現在準備中です</p>
              <p className="text-sm text-amber-700 dark:text-amber-400/80">
                サブスクリプション機能は現在準備中です。正式リリースまでもうしばらくお待ちください。
                リリース時にはお知らせいたします。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ヘッダー */}
      <div className="text-center mb-6 sm:mb-10 md:mb-14">
        <Badge className="mb-3 sm:mb-4 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs px-3 py-1">
          <Crown className="size-3.5 mr-1.5 inline-block" />
          プラン一覧
        </Badge>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2 sm:mb-3">
          あなたに合ったプランを選ぼう
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
          無料でもすべての問題を解くことができます。Pro プランでさらに効率的に学習を進めましょう。
        </p>
      </div>

      {/* エラー */}
      {error && (
        <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 p-4 flex items-start gap-3 max-w-2xl mx-auto">
          <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* プラン */}
      <div className="grid gap-3 sm:gap-6 md:grid-cols-3 mb-12">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isFree = plan.id === 'free';
          const isLoading = loadingPlan === plan.id;
          const isPreparingPlan = !isFree && !stripeActive;

          return (
            <Card
              key={plan.id}
              className={`relative flex gap-2 flex-col ${plan.color} ${plan.popular ? 'border-2 shadow-lg shadow-blue-500/10' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-600 hover:bg-blue-600 text-white text-xs px-3 py-0.5">
                    おすすめ
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-1 sm:pb-2 sm:text-center">
                <div className="flex items-center gap-3 sm:block">
                  <div
                    className={`shrink-0 flex size-9 sm:size-12 sm:mx-auto sm:mb-3 items-center justify-center rounded-full ${isFree ? 'bg-gray-100 dark:bg-gray-800' : plan.popular ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-violet-100 dark:bg-violet-900/40'}`}
                  >
                    <Icon
                      className={`size-4 sm:size-6 ${isFree ? 'text-gray-500' : plan.popular ? 'text-blue-600 dark:text-blue-400' : 'text-violet-600 dark:text-violet-400'}`}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-1.5 flex-wrap sm:justify-center">
                      <CardTitle className="text-sm sm:text-lg whitespace-nowrap">
                        {plan.name}
                      </CardTitle>
                      {isPreparingPlan && (
                        <Badge className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-[10px] px-1.5 py-0 leading-4 sm:hidden">
                          準備中
                        </Badge>
                      )}
                    </div>
                    <div className="mt-0.5 sm:mt-2">
                      <span className="text-xl sm:text-3xl font-extrabold text-foreground whitespace-nowrap">
                        {plan.price}
                      </span>
                      <span className="text-xs sm:text-sm text-muted-foreground ml-0.5">
                        /{plan.interval}
                      </span>
                    </div>
                    {isPreparingPlan && (
                      <p className="hidden sm:block text-xs text-amber-600 dark:text-amber-400 mt-1">
                        準備中
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 pt-1 sm:pt-0">
                <ul className="space-y-1 sm:space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-1.5 sm:gap-2.5">
                      <Check
                        className={`size-3.5 sm:size-4 shrink-0 mt-0.5 ${isFree ? 'text-gray-400' : 'text-green-500'}`}
                      />
                      <span className="text-xs sm:text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-0 sm:pt-0">
                {isFree ? (
                  <Button
                    variant="outline"
                    className="w-full rounded-full h-8 sm:h-10 text-xs sm:text-sm"
                    onClick={() => router.push('/#categories')}
                  >
                    問題を解く
                  </Button>
                ) : (
                  <Button
                    className={`w-full rounded-full h-8 sm:h-10 text-xs sm:text-sm ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-violet-600 hover:bg-violet-700'} text-white`}
                    disabled={isLoading || isPreparingPlan}
                    onClick={() => handleSubscribe(plan)}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="size-3.5 sm:size-4 mr-1.5 sm:mr-2 animate-spin" />
                        処理中...
                      </>
                    ) : isPreparingPlan ? (
                      '準備中'
                    ) : (
                      <>
                        <CreditCard className="size-3.5 sm:size-4 mr-1.5 sm:mr-2" />
                        このプランを選ぶ
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto mb-12">
        <h2 className="text-xl font-bold text-center mb-6 text-foreground">よくある質問</h2>
        <div className="space-y-4">
          {[
            {
              q: '無料でもすべての問題を解けますか？',
              a: 'はい、フリープランでもすべてのカテゴリ・すべての問題を制限なく解くことができます。',
            },
            {
              q: 'Pro プランはいつでも解約できますか？',
              a: 'はい、いつでもご自身でキャンセルでき、次の請求サイクルから課金が停止されます。',
            },
            {
              q: '支払い方法は何に対応していますか？',
              a: 'クレジットカード（Visa / Mastercard / AMEX）に対応しています。決済は Stripe を通じて安全に処理されます。',
            },
            {
              q: '年額プランは途中解約で返金されますか？',
              a: '年額プランの途中解約による日割り返金は行っておりません。残りの契約期間は引き続きご利用いただけます。',
            },
          ].map((faq) => (
            <div key={faq.q} className="rounded-md border p-4 bg-muted/30">
              <p className="font-semibold text-sm text-foreground mb-1.5">Q. {faq.q}</p>
              <p className="text-sm text-muted-foreground">A. {faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* サブスク管理 */}
      {isLoggedIn && (
        <section className="max-w-md mx-auto text-center">
          <Card className="bg-muted/30">
            <CardContent className="pt-6 space-y-3">
              <Shield className="size-8 text-muted-foreground mx-auto" />
              <p className="text-sm font-semibold text-foreground">サブスクリプションの管理</p>
              <p className="text-xs text-muted-foreground">
                プランの変更・解約・支払い方法の更新は Stripe のポータルから行えます。
              </p>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={handlePortal}
                disabled={portalLoading}
              >
                {portalLoading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    読み込み中...
                  </>
                ) : (
                  '管理ポータルを開く'
                )}
              </Button>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
