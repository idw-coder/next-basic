import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import SuccessContent from "./SuccessContent";

export default function PaymentSuccessPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 md:py-24">
      <Suspense
        fallback={
          <Card>
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <Loader2 className="size-12 text-muted-foreground mx-auto animate-spin" />
              <p className="text-muted-foreground">読み込み中...</p>
            </CardContent>
          </Card>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  );
}
