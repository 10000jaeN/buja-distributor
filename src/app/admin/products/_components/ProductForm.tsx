"use client";

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Category } from "@/types/product";
import Image from "next/image";

export type ContentBlock = { type: "text" | "image"; value: string };

export type ProductFormData = {
  name: string;
  price: string;
  shippingFee: string;
  freeShippingThreshold: string;
  categoryParent: string;
  categoryChild: string;
  thumbnail: string;
  isAvailable: boolean;
  contentBlocks: ContentBlock[];
};

export const INITIAL_FORM: ProductFormData = {
  name: "",
  price: "",
  shippingFee: "3000",
  freeShippingThreshold: "0",
  categoryParent: "",
  categoryChild: "",
  thumbnail: "",
  isAvailable: true,
  contentBlocks: [],
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
  onBlockChange: (index: number, field: keyof ContentBlock, value: string) => void;
  onAddBlock: () => void;
  onRemoveBlock: (index: number) => void;
  categories: Category[];
};

export function ProductForm({
  form,
  onChange,
  onBlockChange,
  onAddBlock,
  onRemoveBlock,
  categories,
}: Props) {
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

      {/* 배송비 */}
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-gray-700">
          배송비 (원) <span className="text-brand-blue">*</span>
        </Label>
        <Input
          type="number"
          value={form.shippingFee}
          onChange={(e) => onChange("shippingFee", e.target.value)}
          placeholder="0"
          min="0"
          required
        />
        <p className="text-xs text-gray-400">무료배송은 0으로 입력하세요.</p>
      </div>

      {/* 무료배송 기준금액 */}
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-gray-700">
          무료배송 기준금액 (원)
        </Label>
        <Input
          type="number"
          value={form.freeShippingThreshold}
          onChange={(e) => onChange("freeShippingThreshold", e.target.value)}
          placeholder="0"
          min="0"
        />
        <p className="text-xs text-gray-400">0이면 무료배송 조건 없음.</p>
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
                <SelectValue>{form.categoryChild || "소분류 선택"}</SelectValue>
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

      {/* 콘텐츠 블록 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold text-gray-700">
            콘텐츠 블록
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddBlock}
            className="border-brand-blue text-brand-blue hover:bg-brand-blue/10 hover:text-brand-blue"
          >
            + 블록 추가
          </Button>
        </div>

        {form.contentBlocks.length === 0 && (
          <p className="border-brand-blue/30 bg-brand-blue/5 text-brand-blue/60 rounded-md border border-dashed py-5 text-center text-sm">
            블록이 없습니다. 블록 추가 버튼을 눌러주세요.
          </p>
        )}

        <div className="space-y-3">
          {form.contentBlocks.map((block, i) => (
            <div
              key={i}
              className="rounded-md border border-gray-200 bg-gray-50 p-3"
            >
              <div className="mb-2 flex items-center gap-2">
                <Select
                  value={block.type}
                  onValueChange={(v) => v && onBlockChange(i, "type", v)}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">텍스트</SelectItem>
                    <SelectItem value="image">이미지</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveBlock(i)}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  삭제
                </Button>
              </div>
              {block.type === "image" ? (
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="file:bg-brand-blue/10 file:text-brand-blue hover:file:bg-brand-blue/20 block w-full text-sm text-gray-500 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:px-3 file:py-1.5 file:text-sm file:font-medium"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = await uploadToS3(file);
                      onBlockChange(i, "value", url);
                    }}
                  />
                  {block.value && (
                    <div className="relative h-32 w-full overflow-hidden rounded-md border border-gray-200">
                      <Image
                        src={block.value}
                        alt="미리보기"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <Textarea
                  value={block.value}
                  onChange={(e) => onBlockChange(i, "value", e.target.value)}
                  placeholder="텍스트 입력"
                  rows={2}
                  className="resize-none bg-white"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
