"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkoutService } from "@/api/checkoutService";
import useCheckoutStore from "@/store/useCheckoutStore";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clear } = useCheckoutStore();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [orderNumber, setOrderNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const confirmedRef = useRef(false);

  useEffect(() => {
    if (confirmedRef.current) return;
    confirmedRef.current = true;

    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    if (!paymentKey || !orderId || !amount) {
      setStatus("error");
      setErrorMessage("결제 정보가 올바르지 않습니다.");
      return;
    }

    checkoutService
      .confirmPayment({ paymentKey, orderId, amount: Number(amount) })
      .then((result) => {
        setOrderNumber(result.orderNumber);
        setStatus("success");
        clear();
      })
      .catch((err: unknown) => {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || "결제 승인에 실패했습니다.";
        setErrorMessage(message);
        setStatus("error");
      });
  }, [searchParams, clear]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="border-brand-blue h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="text-sm text-gray-500">결제를 확인하는 중입니다...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="text-lg font-bold text-red-500">결제에 실패했습니다</p>
        <p className="text-sm text-gray-500">{errorMessage}</p>
        <Button variant="outline" onClick={() => router.push("/cart")}>
          장바구니로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-5 text-center">
      <CheckCircle className="text-brand-blue h-16 w-16" />
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">결제 완료!</h1>
        <p className="text-sm text-gray-500">주문이 성공적으로 접수되었습니다.</p>
      </div>
      {orderNumber && (
        <div className="rounded-lg bg-gray-50 px-6 py-3 text-sm text-gray-600">
          주문번호 <span className="font-bold text-foreground">{orderNumber}</span>
        </div>
      )}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.push("/mypage/orders")}>
          주문 내역 보기
        </Button>
        <Button onClick={() => router.push("/")}>쇼핑 계속하기</Button>
      </div>
    </div>
  );
}
