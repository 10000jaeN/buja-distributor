"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutFailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const errorCode = searchParams.get("code");
  const errorMessage = searchParams.get("message") || "결제에 실패했습니다.";

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-5 text-center">
      <XCircle className="h-16 w-16 text-red-400" />
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">결제 실패</h1>
        <p className="text-sm text-gray-500">{errorMessage}</p>
        {errorCode && (
          <p className="text-xs text-gray-400">오류 코드: {errorCode}</p>
        )}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.push("/cart")}>
          장바구니로 돌아가기
        </Button>
        <Button onClick={() => router.back()}>다시 시도</Button>
      </div>
    </div>
  );
}
