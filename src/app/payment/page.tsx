import type { Metadata } from "next";
import SubscriptionClient from "./SubscriptionClient";

export const metadata: Metadata = {
  title: "プラン・お支払い | ウェブエンジニア問題集",
  description:
    "ウェブエンジニア問題集のサブスクリプションプラン一覧。無料でも全問題を解くことができます。",
};

export default function PaymentPage() {
  return <SubscriptionClient />;
}
