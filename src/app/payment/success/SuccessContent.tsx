"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchNextApiJson } from "@/lib/nextApiClient";

interface PaymentStatus {
  status: string;
  amount: number;
  currency: string;
}

interface PaymentStatusResponse {
  payment: PaymentStatus;
}

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [payment, setPayment] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(!!sessionId);

  useEffect(() => {
    if (!sessionId) return;

    const fetchStatus = async () => {
      try {
        const res = await fetchNextApiJson<PaymentStatusResponse>(
          `/next-api/payment/status/${sessionId}`,
          { auth: true },
        );
        setPayment(res.payment);
      } catch {
        // 決済状態が取得できなくても、Stripe側で成功しているため問題ない
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [sessionId]);

  return (
    <Card>
      <CardContent className="pt-8 pb-8 text-center space-y-4">
        {loading ? (
          <>
            <Loader2 className="size-12 text-muted-foreground mx-auto animate-spin" />
            <p className="text-muted-foreground">決済情報を確認中...</p>
          </>
        ) : (
          <>
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="size-9 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">
              お支払い完了
            </h1>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              ご登録ありがとうございます。サブスクリプションが有効になりました。
            </p>
            {payment && payment.amount > 0 && (
              <p className="text-lg font-bold text-foreground">
                ¥{payment.amount.toLocaleString()}
              </p>
            )}
            <div className="flex flex-col gap-2 pt-2">
              <Button className="rounded-full" asChild>
                <Link
                  href="/#categories"
                  className="inline-flex items-center gap-2"
                >
                  学習を始める
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" className="rounded-full" asChild>
                <Link href="/payment">プラン一覧に戻る</Link>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
