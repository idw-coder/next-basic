"use client";

import Link from "next/link";
import { XCircle, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PaymentCancelPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 md:py-24">
      <Card>
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <XCircle className="size-9 text-gray-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">
            お支払いがキャンセルされました
          </h1>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            決済は行われていません。引き続き無料でクイズをお楽しみいただけます。
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Button className="rounded-full" asChild>
              <Link
                href="/payment"
                className="inline-flex items-center gap-2"
              >
                <ArrowLeft className="size-4" />
                プラン一覧に戻る
              </Link>
            </Button>
            <Button variant="outline" className="rounded-full" asChild>
              <Link href="/#categories">問題を解く</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
