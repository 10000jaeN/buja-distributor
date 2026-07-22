"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Category } from "@/types/product";
import Image from "next/image";
import { toast } from "sonner";
import { ProductEditor } from "./ProductEditor";

export type ShippingType = "free" | "bundle" | "paid";

export type ProductFormData = {
  name: string;
  price: string;
  shippingType: ShippingType;
  shippingFee: string;
  freeShippingThreshold: string;
  categoryParent: string;
  categoryChild: string;
  thumbnail: string;
  stock: string;
  isAvailable: boolean;
  content: string;
};

export const INITIAL_FORM: ProductFormData = {
  name: "",
  price: "",
  shippingType: "paid",
  shippingFee: "3000",
  freeShippingThreshold: "0",
  categoryParent: "",
  categoryChild: "",
  thumbnail: "",
  stock: "",
  isAvailable: true,
  content: "",
};

async function fetchUpload(token: string | null, file: File): Promise<Response> {
  const formData = new FormData();
  formData.append("file", file);
  return fetch("/api/upload", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const baseURL =
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
    const r = await fetch(`${baseURL}/auth/token/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!r.ok) return null;
    const data = await r.json();
    const newToken: string = data.accessToken;
    const isAutoLogin = localStorage.getItem("autoLogin") !== "false";
    if (isAutoLogin) localStorage.setItem("accessToken", newToken);
    else sessionStorage.setItem("accessToken", newToken);
    return newToken;
  } catch {
    return null;
  }
}

export async function uploadToS3(file: File): Promise<string> {
  let token =
    localStorage.getItem("accessToken") ?? sessionStorage.getItem("accessToken");

  let res = await fetchUpload(token, file);

  if (res.status === 401) {
    token = await refreshAccessToken();
    if (!token) throw new Error("로그인이 만료되었습니다. 다시 로그인해 주세요.");
    res = await fetchUpload(token, file);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "이미지 업로드에 실패했습니다.");
  }
  const { url } = await res.json();
  return url;
}

type Props = {
  form: ProductFormData;
  onChange: (field: keyof ProductFormData, value: string | boolean) => void;
  categories: Category[];
};

export function ProductForm({ form, onChange, categories }: Props) {
  return (
    <div className="space-y-5">
      {/* 2컬럼 그리드 영역 */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* 왼쪽 컬럼 카드: 상품명, 가격, 배송 방식 */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm font-bold text-gray-800">기본 정보</p>
          <div className="space-y-5">
            {/* 상품명 */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">
                상품명 <span className="text-brand-blue">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => onChange("name", e.target.value)}
                placeholder="상품명을 입력하세요"
                required
              />
            </div>

            {/* 가격 */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">
                가격 <span className="text-brand-blue">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => onChange("price", e.target.value)}
                  placeholder="0"
                  min="0"
                  required
                  className="pr-8"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  원
                </span>
              </div>
            </div>

            {/* 배송 방식 */}
            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-gray-700">
                배송 방식 <span className="text-brand-blue">*</span>
              </Label>
              <div className="flex gap-2">
                {(
                  [
                    { value: "free", label: "무료배송" },
                    { value: "bundle", label: "묶음배송" },
                    { value: "paid", label: "유료배송" },
                  ] as { value: ShippingType; label: string }[]
                ).map(({ value, label }) => (
                  <label key={value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="shippingType"
                      value={value}
                      checked={form.shippingType === value}
                      onChange={() => onChange("shippingType", value)}
                      className="sr-only"
                    />
                    <span
                      className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                        form.shippingType === value
                          ? "bg-brand-blue text-white"
                          : "border border-gray-200 bg-white text-gray-600 hover:border-brand-blue hover:text-brand-blue"
                      }`}
                    >
                      {label}
                    </span>
                  </label>
                ))}
              </div>

              {form.shippingType === "bundle" && (
                <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-3.5">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-600">
                      배송비
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={form.shippingFee}
                        onChange={(e) =>
                          onChange("shippingFee", e.target.value)
                        }
                        placeholder="3000"
                        min="0"
                        className="pr-8"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                        원
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-600">
                      개별 무료배송 기준금액
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={form.freeShippingThreshold}
                        onChange={(e) =>
                          onChange("freeShippingThreshold", e.target.value)
                        }
                        placeholder="0"
                        min="0"
                        className="pr-8"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                        원
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      묶음 상품 합계 50,000원 이상 시 전체 무료 적용됩니다.
                    </p>
                  </div>
                </div>
              )}

              {form.shippingType === "paid" && (
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3.5">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-600">
                      배송비
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={form.shippingFee}
                        onChange={(e) =>
                          onChange("shippingFee", e.target.value)
                        }
                        placeholder="3000"
                        min="0"
                        className="pr-8"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                        원
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽 컬럼 카드: 카테고리, 썸네일, 재고 여부 */}
        <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm font-bold text-gray-800">상품 설정</p>
          <div className="flex flex-1 flex-col space-y-5">
            {/* 카테고리 */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">
                카테고리
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-xs text-gray-500">대분류</span>
                  <Select
                    value={form.categoryParent}
                    onValueChange={(v) => {
                      if (!v) return;
                      onChange("categoryParent", v);
                      onChange("categoryChild", "");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {form.categoryParent || "대분류 선택"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.parent} value={cat.parent}>
                          {cat.parent}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-500">소분류</span>
                  <Select
                    value={form.categoryChild}
                    onValueChange={(v) => v && onChange("categoryChild", v)}
                    disabled={!form.categoryParent}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {form.categoryChild || "소분류 선택"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        categories.find(
                          (c) => c.parent === form.categoryParent,
                        )?.children ?? []
                      ).map((child) => (
                        <SelectItem key={child} value={child}>
                          {child}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 썸네일 */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                썸네일
              </Label>
              {form.thumbnail ? (
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <Image
                    src={form.thumbnail.trim()}
                    alt="썸네일"
                    width={72}
                    height={72}
                    className="h-18 w-18 shrink-0 rounded-md border border-gray-200 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-gray-500">
                      {form.thumbnail.trim().split("/").pop()}
                    </p>
                    <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-brand-blue hover:text-brand-blue">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                        />
                      </svg>
                      이미지 변경
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const url = await uploadToS3(file);
                            onChange("thumbnail", url);
                          } catch (err) {
                            toast.error(err instanceof Error ? err.message : "이미지 업로드에 실패했습니다.");
                          }
                        }}
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChange("thumbnail", "")}
                    className="shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    title="삭제"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="size-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-5 transition-colors hover:border-brand-blue hover:bg-brand-blue/5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18v-1.5M16.5 12L12 7.5m0 0L7.5 12M12 7.5V18"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-500">
                    이미지 선택
                  </span>
                  <span className="text-xs text-gray-400">
                    PNG, JPG, WEBP 지원
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const url = await uploadToS3(file);
                        onChange("thumbnail", url);
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "이미지 업로드에 실패했습니다.");
                      }
                    }}
                  />
                </label>
              )}
            </div>

            {/* 재고 수량 */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <Label className="mb-2 block text-sm font-semibold text-gray-700">
                재고 수량
              </Label>
              <p className="mb-2.5 text-xs text-gray-400">비워두면 무제한으로 설정됩니다.</p>
              <Input
                type="number"
                min={0}
                placeholder="무제한"
                value={form.stock}
                onChange={(e) => onChange("stock", e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            {/* 재고 여부 */}
            <div className="mt-auto flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold text-gray-700">
                  재고 여부
                </Label>
                <p className="text-xs text-gray-400">
                  품절 시 상품 목록에서 숨겨집니다.
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <span
                  className={`text-sm font-medium transition-colors ${form.isAvailable ? "text-brand-blue" : "text-gray-400"}`}
                >
                  {form.isAvailable ? "재고 있음" : "품절"}
                </span>
                <Switch
                  checked={form.isAvailable}
                  onCheckedChange={(v) => onChange("isAvailable", v)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 전체 너비: 상품 상세 에디터 카드 */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="mb-4 text-sm font-bold text-gray-800">상품 상세</p>
        <ProductEditor
          value={form.content}
          onChange={(html) => onChange("content", html)}
        />
      </div>
    </div>
  );
}
