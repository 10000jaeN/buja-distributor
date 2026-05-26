"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { loadTossPayments, type TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import useCheckoutStore from "@/store/useCheckoutStore";
import useAuthStore from "@/store/useAuthStore";
import { checkoutService } from "@/api/checkoutService";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, shippingFee, totalAmount } = useCheckoutStore();
  const { user } = useAuthStore();

  const [form, setForm] = useState({
    recipientName: "",
    phoneNumber: "",
    zipCode: "",
    mainAddress: "",
    detailAddress: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);

  const widgetRef = useRef<TossPaymentsWidgets | null>(null);

  // 장바구니에서 넘어오지 않은 경우 리다이렉트
  useEffect(() => {
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [items, router]);

  // Toss 위젯 초기화
  useEffect(() => {
    if (items.length === 0 || !user) return;

    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;
    const customerKey = user.userId;

    (async () => {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        const widgets = tossPayments.widgets({ customerKey });
        await widgets.setAmount({ currency: "KRW", value: totalAmount });
        await widgets.renderPaymentMethods({
          selector: "#payment-method",
          variantKey: "DEFAULT",
        });
        await widgets.renderAgreement({
          selector: "#agreement",
          variantKey: "AGREEMENT",
        });

        widgetRef.current = widgets;
        setWidgetReady(true);
      } catch {
        toast.error("결제 위젯을 불러오지 못했습니다.");
      }
    })();
  }, [items, user, totalAmount]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePay = async () => {
    if (!form.recipientName || !form.phoneNumber || !form.mainAddress || !form.zipCode) {
      toast.error("배송지 정보를 모두 입력해주세요.");
      return;
    }
    if (!widgetReady) {
      toast.error("결제 위젯이 준비되지 않았습니다.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. 주문 생성
      const { orderId } = await checkoutService.createOrder({
        items: items.map(({ productId, quantity }) => ({ productId, quantity })),
        shippingAddress: form,
      });

      // 2. Toss 결제 요청
      await widgetRef.current!.requestPayment({
        orderId,
        orderName:
          items.length === 1
            ? items[0].name
            : `${items[0].name} 외 ${items.length - 1}건`,
        successUrl: `${window.location.origin}/checkout/success`,
        failUrl: `${window.location.origin}/checkout/fail`,
        customerEmail: user?.email,
        customerName: user?.nickName,
      });

    } catch (err: unknown) {
      const message = (err as { message?: string })?.message;
      if (message !== "사용자가 결제를 취소하였습니다.") {
        toast.error(message || "결제 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="mx-auto max-w-[1024px] px-5 py-8">
      <h1 className="mb-8 text-xl font-bold text-foreground">주문서</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* 왼쪽: 배송지 + 결제 위젯 */}
        <div className="space-y-6">
          {/* 주문 상품 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-foreground">주문 상품</h2>
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.productId} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.name}{" "}
                    <span className="text-gray-400">× {item.quantity}</span>
                  </span>
                  <span className="font-medium text-foreground">
                    {(item.price * item.quantity).toLocaleString()}원
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* 배송지 입력 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-foreground">배송지</h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>받는 분 이름 *</Label>
                <Input
                  value={form.recipientName}
                  onChange={(e) => handleChange("recipientName", e.target.value)}
                  placeholder="이름을 입력하세요"
                />
              </div>
              <div className="space-y-1.5">
                <Label>연락처 *</Label>
                <Input
                  value={form.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  placeholder="010-0000-0000"
                />
              </div>
              <div className="space-y-1.5">
                <Label>우편번호 *</Label>
                <Input
                  value={form.zipCode}
                  onChange={(e) => handleChange("zipCode", e.target.value)}
                  placeholder="12345"
                />
              </div>
              <div className="space-y-1.5">
                <Label>기본 주소 *</Label>
                <Input
                  value={form.mainAddress}
                  onChange={(e) => handleChange("mainAddress", e.target.value)}
                  placeholder="기본 주소를 입력하세요"
                />
              </div>
              <div className="space-y-1.5">
                <Label>상세 주소</Label>
                <Input
                  value={form.detailAddress}
                  onChange={(e) => handleChange("detailAddress", e.target.value)}
                  placeholder="상세 주소를 입력하세요"
                />
              </div>
            </div>
          </div>

          {/* Toss 결제 위젯 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-foreground">결제 수단</h2>
            <div id="payment-method" />
            <div id="agreement" className="mt-4" />
          </div>
        </div>

        {/* 오른쪽: 주문 요약 */}
        <div className="h-fit rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <h2 className="mb-4 text-base font-bold text-foreground">결제 금액</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>상품 금액</span>
              <span>{subtotal.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>배송비</span>
              <span>{shippingFee === 0 ? "무료" : `${shippingFee.toLocaleString()}원`}</span>
            </div>
          </div>
          <div className="my-4 border-t border-gray-100" />
          <div className="flex justify-between font-bold text-foreground">
            <span>총 결제 금액</span>
            <span className="text-brand-blue text-lg">{totalAmount.toLocaleString()}원</span>
          </div>

          <Button
            className="mt-6 w-full"
            onClick={handlePay}
            disabled={isLoading || !widgetReady}
          >
            {isLoading ? "처리 중..." : `${totalAmount.toLocaleString()}원 결제하기`}
          </Button>
        </div>
      </div>
    </div>
  );
}
