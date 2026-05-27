"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const TOSS_ERROR_MESSAGES: Record<string, string> = {
  PAY_PROCESS_CANCELED: "결제를 취소했습니다.",
  PAY_PROCESS_ABORTED: "결제 진행 중 오류가 발생했습니다.",
  REJECT_CARD_COMPANY: "카드사에서 결제를 거절했습니다.",
  INVALID_CARD_EXPIRATION: "카드 유효기간을 확인해주세요.",
  INVALID_STOPPED_CARD: "정지된 카드입니다.",
  EXCEED_MAX_CARD_INSTALLMENT_PLAN: "할부 개월 수를 확인해주세요.",
  NOT_SUPPORTED_INSTALLMENT_PLAN: "이 카드는 할부 결제를 지원하지 않습니다.",
  INVALID_CARD_INSTALLMENT_PLAN: "할부 결제가 불가능한 카드입니다.",
  NOT_SUPPORTED_MONTHLY_INSTALLMENT_PLAN: "이 카드는 무이자 할부를 지원하지 않습니다.",
  EXCEED_MAX_AMOUNT: "결제 한도를 초과했습니다.",
  INVALID_ACCOUNT_INFO: "계좌 정보를 확인해주세요.",
  FAILED_PAYMENT_INTERNAL_SYSTEM_PROCESSING: "결제 처리 중 오류가 발생했습니다.",
};

export default function CheckoutFailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const errorCode = searchParams.get("code") ?? "";
  const errorMessage = TOSS_ERROR_MESSAGES[errorCode] ?? "결제에 실패했습니다.";

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-5 text-center">
      <XCircle className="h-16 w-16 text-red-400" />
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">결제 실패</h1>
        <p className="text-sm text-gray-500">{errorMessage}</p>
        {errorCode in TOSS_ERROR_MESSAGES && (
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
