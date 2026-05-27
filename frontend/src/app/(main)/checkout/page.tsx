"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import useCheckoutStore from "@/store/useCheckoutStore";
import useAuthStore from "@/store/useAuthStore";
import { checkoutService } from "@/api/checkoutService";
import { userService, type Address } from "@/api/userService";

const PAYMENT_METHODS = [
  { key: "CARD", label: "신용/체크카드" },
  { key: "TRANSFER", label: "계좌이체" },
  { key: "VIRTUAL_ACCOUNT", label: "가상계좌" },
  { key: "MOBILE_PHONE", label: "휴대폰" },
] as const;

type PaymentMethodKey = (typeof PAYMENT_METHODS)[number]["key"];

const EMPTY_FORM = {
  recipientName: "",
  phoneNumber: "",
  zipCode: "",
  mainAddress: "",
  detailAddress: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, shippingFee, totalAmount } = useCheckoutStore();
  const { user } = useAuthStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "direct">("direct");
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodKey>("CARD");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [items, router]);

  // 저장된 배송지 불러오기 + 기본 배송지 자동입력
  useEffect(() => {
    if (!user) return;
    userService.getProfile().then((profile) => {
      const addrs = profile.address ?? [];
      setAddresses(addrs);
      const defaultAddr = addrs.find((a) => a.isDefault) ?? addrs[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id);
        setForm({
          recipientName: defaultAddr.recipientName,
          phoneNumber: defaultAddr.phoneNumber,
          zipCode: defaultAddr.zipCode,
          mainAddress: defaultAddr.mainAddress,
          detailAddress: defaultAddr.detailAddress ?? "",
        });
      }
    }).catch(() => {});
  }, [user]);

  const handleAddressSelect = (id: string | "direct") => {
    setSelectedAddressId(id);
    if (id === "direct") {
      setForm(EMPTY_FORM);
      return;
    }
    const addr = addresses.find((a) => a._id === id);
    if (addr) {
      setForm({
        recipientName: addr.recipientName,
        phoneNumber: addr.phoneNumber,
        zipCode: addr.zipCode,
        mainAddress: addr.mainAddress,
        detailAddress: addr.detailAddress ?? "",
      });
    }
  };

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePay = async () => {
    if (!form.recipientName || !form.phoneNumber || !form.mainAddress || !form.zipCode) {
      toast.error("배송지 정보를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const { orderId } = await checkoutService.createOrder({
        items: items.map(({ productId, quantity }) => ({ productId, quantity })),
        shippingAddress: form,
      });

      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;
      const tossPayments = await loadTossPayments(clientKey);
      const payment = tossPayments.payment({ customerKey: user!.userId });

      const orderName =
        items.length === 1
          ? items[0].name
          : `${items[0].name} 외 ${items.length - 1}건`;

      // SDK가 메서드별 오버로드 타입을 사용하여 유니온 타입 직접 전달 불가 → 타입 단언 사용
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (payment.requestPayment as (req: any) => Promise<void>)({
        method: selectedMethod,
        amount: { currency: "KRW", value: totalAmount },
        orderId,
        orderName,
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

          {/* 배송지 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-foreground">배송지</h2>

            {/* 저장된 배송지 선택 */}
            {addresses.length > 0 && (
              <div className="mb-5 space-y-2">
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                      selectedAddressId === addr._id
                        ? "border-brand-blue bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr._id}
                      onChange={() => handleAddressSelect(addr._id)}
                      className="accent-brand-blue mt-0.5"
                    />
                    <div className="flex-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">{addr.recipientName}</span>
                        <span className="text-gray-400">{addr.phoneNumber}</span>
                        {addr.isDefault && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-brand-blue">
                            기본
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-gray-500">
                        {addr.mainAddress} {addr.detailAddress}
                      </p>
                    </div>
                  </label>
                ))}
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    selectedAddressId === "direct"
                      ? "border-brand-blue bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === "direct"}
                    onChange={() => handleAddressSelect("direct")}
                    className="accent-brand-blue"
                  />
                  <span className="text-sm font-medium text-gray-700">직접 입력</span>
                </label>
              </div>
            )}

            {/* 폼 (선택된 배송지 수정 or 직접 입력) */}
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

          {/* 결제 수단 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-foreground">결제 수단</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PAYMENT_METHODS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedMethod(key)}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                    selectedMethod === key
                      ? "border-brand-blue bg-blue-50 text-brand-blue"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 오른쪽: 결제 금액 */}
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
            disabled={isLoading}
          >
            {isLoading ? "처리 중..." : `${totalAmount.toLocaleString()}원 결제하기`}
          </Button>
        </div>
      </div>
    </div>
  );
}
