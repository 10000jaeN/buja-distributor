"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import useCheckoutStore from "@/store/useCheckoutStore";
import useAuthStore from "@/store/useAuthStore";
import { checkoutService, type PreviewOrderResult } from "@/api/checkoutService";
import { userService, type Address } from "@/api/userService";
import { formatPhoneNumber } from "@/lib/utils";

declare global {
  interface Window {
    daum: {
      Postcode: new (config: {
        oncomplete: (data: {
          zonecode: string;
          address: string;
          jibunAddress: string;
          addressType: string;
        }) => void;
      }) => { open: () => void };
    };
  }
}

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
  const { items } = useCheckoutStore();
  const { user } = useAuthStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "direct">("direct");
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodKey>("CARD");
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewOrderResult | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [items, router]);

  // 주소 변경 시 금액 미리보기 (600ms 디바운스)
  useEffect(() => {
    if (!form.mainAddress || items.length === 0) {
      setPreview(null);
      return;
    }
    setPreviewLoading(true);
    const timer = setTimeout(async () => {
      try {
        const result = await checkoutService.previewOrder({
          items: items.map(({ productId, quantity }) => ({ productId, quantity })),
          mainAddress: form.mainAddress,
        });
        setPreview(result);
      } catch {
        setPreview(null);
      } finally {
        setPreviewLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [form.mainAddress, items]);

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

  const openPostcode = () => {
    if (!window.daum?.Postcode) {
      toast.error("주소 검색 서비스를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    new window.daum.Postcode({
      oncomplete: (data) => {
        setForm((prev) => ({
          ...prev,
          zipCode: data.zonecode,
          mainAddress: data.address,
        }));
      },
    }).open();
  };

  const handlePay = async () => {
    if (!form.recipientName || !form.phoneNumber || !form.mainAddress || !form.zipCode) {
      toast.error("배송지 정보를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const { orderId, totalAmount: orderTotal } = await checkoutService.createOrder({
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

      const paymentParams = {
        amount: { currency: "KRW" as const, value: orderTotal },
        orderId,
        orderName,
        successUrl: `${window.location.origin}/checkout/success`,
        failUrl: `${window.location.origin}/checkout/fail`,
        customerEmail: user?.email,
        customerName: user?.nickName,
      };

      if (selectedMethod === "CARD") {
        await payment.requestPayment({ method: "CARD", ...paymentParams });
      } else if (selectedMethod === "TRANSFER") {
        await payment.requestPayment({ method: "TRANSFER", ...paymentParams });
      } else if (selectedMethod === "VIRTUAL_ACCOUNT") {
        await payment.requestPayment({ method: "VIRTUAL_ACCOUNT", ...paymentParams });
      } else if (selectedMethod === "MOBILE_PHONE") {
        await payment.requestPayment({ method: "MOBILE_PHONE", ...paymentParams });
      }
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
  const displayTotal = preview?.totalAmount ?? subtotal;

  return (
    <div className="mx-auto max-w-[1024px] px-5 py-8">
      <Script
        src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="lazyOnload"
      />
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
                  maxLength={20}
                />
              </div>
              <div className="space-y-1.5">
                <Label>연락처 *</Label>
                <Input
                  value={form.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", formatPhoneNumber(e.target.value))}
                  placeholder="전화번호를 입력하세요"
                  maxLength={13}
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-1.5">
                <Label>주소 *</Label>
                <div className="flex gap-2">
                  <Input
                    value={form.zipCode}
                    readOnly
                    placeholder="우편번호"
                    className="w-28 bg-gray-50"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={openPostcode}>
                    주소 검색
                  </Button>
                </div>
                <Input
                  value={form.mainAddress}
                  readOnly
                  placeholder="주소 검색을 이용해주세요"
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-1.5">
                <Label>상세 주소</Label>
                <Input
                  value={form.detailAddress}
                  onChange={(e) => handleChange("detailAddress", e.target.value)}
                  placeholder="상세 주소를 입력하세요 (동/호수 등)"
                  maxLength={50}
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
              <span>기본 배송비</span>
              <span>
                {previewLoading
                  ? "계산 중..."
                  : preview
                    ? preview.baseShippingFee === 0
                      ? "무료"
                      : `${preview.baseShippingFee.toLocaleString()}원`
                    : form.mainAddress
                      ? "계산 중..."
                      : "-"}
              </span>
            </div>
            {preview && preview.extraShippingFee > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>도서산간 추가 배송비</span>
                <span>{preview.extraShippingFee.toLocaleString()}원</span>
              </div>
            )}
          </div>
          <div className="my-4 border-t border-gray-100" />
          <div className="flex justify-between font-bold text-foreground">
            <span>총 결제 금액</span>
            <span className="text-brand-blue text-lg">
              {previewLoading ? "계산 중..." : `${displayTotal.toLocaleString()}원`}
            </span>
          </div>

          <Button
            className="mt-6 w-full"
            onClick={handlePay}
            disabled={isLoading || previewLoading || !preview}
          >
            {isLoading ? "처리 중..." : `${displayTotal.toLocaleString()}원 결제하기`}
          </Button>
          {!preview && !previewLoading && (
            <p className="mt-2 text-center text-xs text-gray-400">배송지를 입력하면 최종 금액이 표시됩니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
