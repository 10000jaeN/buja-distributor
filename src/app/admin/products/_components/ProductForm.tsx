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
  isAvailable: true,
  content: "",
};

export async function uploadToS3(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) throw new Error("이미지 업로드에 실패했습니다.");
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
    <div className="space-y-6">
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
          가격 (원) <span className="text-brand-blue">*</span>
        </Label>
        <Input
          type="number"
          value={form.price}
          onChange={(e) => onChange("price", e.target.value)}
          placeholder="0"
          min="0"
          required
        />
      </div>

      {/* 배송 방식 */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700">
          배송 방식 <span className="text-brand-blue">*</span>
        </Label>
        <div className="flex gap-4">
          {(
            [
              { value: "free", label: "무료배송" },
              { value: "bundle", label: "묶음배송" },
              { value: "paid", label: "유료배송" },
            ] as { value: ShippingType; label: string }[]
          ).map(({ value, label }) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-1.5"
            >
              <input
                type="radio"
                name="shippingType"
                value={value}
                checked={form.shippingType === value}
                onChange={() => onChange("shippingType", value)}
                className="accent-brand-blue"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>

        {form.shippingType === "bundle" && (
          <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-600">
                배송비 (원)
              </Label>
              <Input
                type="number"
                value={form.shippingFee}
                onChange={(e) => onChange("shippingFee", e.target.value)}
                placeholder="3000"
                min="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-600">
                개별 무료배송 기준금액 (원)
              </Label>
              <Input
                type="number"
                value={form.freeShippingThreshold}
                onChange={(e) =>
                  onChange("freeShippingThreshold", e.target.value)
                }
                placeholder="0"
                min="0"
              />
              <p className="text-xs text-gray-400">
                묶음 상품 합계 50,000원 이상 시 전체 무료 적용됩니다.
              </p>
            </div>
          </div>
        )}

        {form.shippingType === "paid" && (
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-600">
                배송비 (원)
              </Label>
              <Input
                type="number"
                value={form.shippingFee}
                onChange={(e) => onChange("shippingFee", e.target.value)}
                placeholder="3000"
                min="0"
              />
            </div>
          </div>
        )}
      </div>

      {/* 카테고리 */}
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-gray-700">카테고리</Label>
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
                  categories.find((c) => c.parent === form.categoryParent)
                    ?.children ?? []
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
        <Label className="text-sm font-semibold text-gray-700">썸네일</Label>
        <input
          type="file"
          accept="image/*"
          multiple
          className="file:bg-brand-blue/10 file:text-brand-blue hover:file:bg-brand-blue/20 block w-full text-sm text-gray-500 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:px-3 file:py-1.5 file:text-sm file:font-medium"
          onChange={async (e) => {
            const files = Array.from(e.target.files ?? []);
            if (!files.length) return;
            const urls = await Promise.all(files.map(uploadToS3));
            onChange("thumbnail", urls.join(", "));
          }}
        />
        {form.thumbnail && (
          <div className="flex flex-wrap gap-2">
            {form.thumbnail.split(",").map((url, i) => (
              <Image
                key={i}
                src={url.trim()}
                alt={`썸네일 ${i + 1}`}
                width={80}
                height={80}
                className="h-20 w-20 rounded-md border border-gray-200 object-cover"
              />
            ))}
          </div>
        )}
      </div>

      {/* 재고 여부 */}
      <div className="flex items-center gap-3 rounded-md border border-gray-100 bg-gray-50 px-3 py-2.5">
        <Label className="text-sm font-semibold text-gray-700">재고 여부</Label>
        <Switch
          checked={form.isAvailable}
          onCheckedChange={(v) => onChange("isAvailable", v)}
        />
        <span
          className={`text-sm font-medium ${form.isAvailable ? "text-brand-blue" : "text-gray-400"}`}
        >
          {form.isAvailable ? "재고 있음" : "품절"}
        </span>
      </div>

      {/* 상품 상세 에디터 */}
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-gray-700">
          상품 상세
        </Label>
        <ProductEditor
          value={form.content}
          onChange={(html) => onChange("content", html)}
        />
      </div>
    </div>
  );
}
