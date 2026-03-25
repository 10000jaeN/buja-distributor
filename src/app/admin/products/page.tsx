"use client";

import { productService } from "@/api/productService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";

type ContentBlock = { type: "text" | "image"; value: string };

type FormData = {
  name: string;
  price: string;
  categoryParent: string;
  categoryChild: string;
  thumbnail: string;
  isAvailable: boolean;
  contentBlocks: ContentBlock[];
};

const INITIAL_FORM: FormData = {
  name: "",
  price: "",
  categoryParent: "",
  categoryChild: "",
  thumbnail: "",
  isAvailable: true,
  contentBlocks: [],
};

// ─── 상품 폼 ──────────────────────────────────────────────────────────────────
function ProductForm({
  form,
  onChange,
  onBlockChange,
  onAddBlock,
  onRemoveBlock,
}: {
  form: FormData;
  onChange: (field: keyof FormData, value: string | boolean) => void;
  onBlockChange: (index: number, field: keyof ContentBlock, value: string) => void;
  onAddBlock: () => void;
  onRemoveBlock: (index: number) => void;
}) {
  return (
    <div className="space-y-4">
      {/* 상품명 */}
      <div className="space-y-1">
        <Label>상품명 <span className="text-red-500">*</span></Label>
        <Input
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="상품명을 입력하세요"
          required
        />
      </div>

      {/* 가격 */}
      <div className="space-y-1">
        <Label>가격 (원) <span className="text-red-500">*</span></Label>
        <Input
          type="number"
          value={form.price}
          onChange={(e) => onChange("price", e.target.value)}
          placeholder="0"
          min="0"
          required
        />
      </div>

      {/* 카테고리 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>카테고리 (부모)</Label>
          <Input
            value={form.categoryParent}
            onChange={(e) => onChange("categoryParent", e.target.value)}
            placeholder="예: 장류"
          />
        </div>
        <div className="space-y-1">
          <Label>카테고리 (자식)</Label>
          <Input
            value={form.categoryChild}
            onChange={(e) => onChange("categoryChild", e.target.value)}
            placeholder="예: 된장"
          />
        </div>
      </div>

      {/* 썸네일 */}
      <div className="space-y-1">
        <Label>썸네일 URL</Label>
        <Textarea
          value={form.thumbnail}
          onChange={(e) => onChange("thumbnail", e.target.value)}
          placeholder={"URL을 쉼표로 구분하여 입력\nhttps://..., https://..."}
          rows={2}
          className="resize-none"
        />
      </div>

      {/* 재고 여부 */}
      <div className="flex items-center gap-3">
        <Label>재고 여부</Label>
        <Switch
          checked={form.isAvailable}
          onCheckedChange={(v) => onChange("isAvailable", v)}
        />
        <span className="text-sm text-gray-500">
          {form.isAvailable ? "재고 있음" : "품절"}
        </span>
      </div>

      {/* 콘텐츠 블록 */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label>콘텐츠 블록</Label>
          <Button type="button" variant="outline" size="sm" onClick={onAddBlock}>
            + 블록 추가
          </Button>
        </div>

        {form.contentBlocks.length === 0 && (
          <p className="rounded-md border border-dashed border-gray-300 py-4 text-center text-sm text-gray-400">
            블록이 없습니다. 블록 추가 버튼을 눌러주세요.
          </p>
        )}

        <div className="space-y-3">
          {form.contentBlocks.map((block, i) => (
            <div key={i} className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="mb-2 flex items-center justify-between">
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
                  className="text-red-400 hover:text-red-600"
                >
                  삭제
                </Button>
              </div>
              <Textarea
                value={block.value}
                onChange={(e) => onBlockChange(i, "value", e.target.value)}
                placeholder={block.type === "image" ? "이미지 URL 입력" : "텍스트 입력"}
                rows={2}
                className="resize-none bg-white"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 메인 페이지 ──────────────────────────────────────────────────────────────
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productService.getProducts({});
      setProducts(data);
    } catch {
      setError("상품 목록을 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleFormChange = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlockChange = (index: number, field: keyof ContentBlock, value: string) => {
    setForm((prev) => {
      const blocks = [...prev.contentBlocks];
      blocks[index] = { ...blocks[index], [field]: value };
      return { ...prev, contentBlocks: blocks };
    });
  };

  const handleAddBlock = () => {
    setForm((prev) => ({
      ...prev,
      contentBlocks: [...prev.contentBlocks, { type: "text", value: "" }],
    }));
  };

  const handleRemoveBlock = (index: number) => {
    setForm((prev) => ({
      ...prev,
      contentBlocks: prev.contentBlocks.filter((_, i) => i !== index),
    }));
  };

  const buildPayload = (f: FormData) => ({
    name: f.name,
    price: Number(f.price),
    category: { parent: f.categoryParent, child: f.categoryChild },
    thumbnail: f.thumbnail.split(",").map((s) => s.trim()).filter(Boolean),
    isAvailable: f.isAvailable,
    contentBlocks: f.contentBlocks,
  });

  const openCreateModal = () => {
    setForm(INITIAL_FORM);
    setFormError(null);
    setShowCreateModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) { setFormError("상품명과 가격은 필수입니다."); return; }
    setIsSubmitting(true);
    setFormError(null);
    try {
      await productService.createProduct(buildPayload(form));
      setShowCreateModal(false);
      await fetchProducts();
    } catch {
      setFormError("상품 추가에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (product: Product) => {
    setForm({
      name: product.name,
      price: String(product.price),
      categoryParent: product.category.parent,
      categoryChild: product.category.child,
      thumbnail: product.thumbnail.join(", "),
      isAvailable: product.isAvailable,
      contentBlocks: product.contentBlock.map((b) => ({ type: b.type, value: b.value })),
    });
    setFormError(null);
    setEditTarget(product);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    if (!form.name || !form.price) { setFormError("상품명과 가격은 필수입니다."); return; }
    setIsSubmitting(true);
    setFormError(null);
    try {
      await productService.updateProduct(editTarget.slug, buildPayload(form));
      setEditTarget(null);
      await fetchProducts();
    } catch {
      setFormError("상품 수정에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await productService.deleteProductBySlug(deleteTarget.slug);
      setDeleteTarget(null);
      await fetchProducts();
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };

  const totalCount = products.length;
  const availableCount = products.filter((p) => p.isAvailable).length;
  const soldOutCount = products.filter((p) => !p.isAvailable).length;

  return (
    <>
      {/* 페이지 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">상품 관리</h1>
        <Button onClick={openCreateModal}>+ 상품 추가</Button>
      </div>

      {/* 스탯 카드 */}
      {!isLoading && !error && (
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: "총 상품", value: totalCount, color: "text-foreground" },
            { label: "판매 가능", value: availableCount, color: "text-brand-blue" },
            { label: "품절", value: soldOutCount, color: "text-gray-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-medium text-gray-500">{label}</p>
              <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* 상품 테이블 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-gray-200 border-t-brand-blue" />
            <span className="text-sm text-gray-500">불러오는 중...</span>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-10 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <Button variant="outline" onClick={fetchProducts} className="mt-3 border-red-300 text-red-600 hover:bg-red-100">
            다시 시도
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["상품명", "가격", "카테고리", "재고", "등록일", "관리"].map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-gray-400">
                    등록된 상품이 없습니다.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="transition-colors duration-150 hover:bg-gray-50">
                    <td className="max-w-48 truncate px-4 py-3 text-sm font-medium text-foreground">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{product.price.toLocaleString()}원</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {product.category.parent}{product.category.child ? ` / ${product.category.child}` : ""}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${product.isAvailable ? "bg-blue-50 text-brand-blue" : "bg-gray-100 text-gray-500"}`}>
                        {product.isAvailable ? "재고 있음" : "품절"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(product.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(product)}>수정</Button>
                        <Button variant="outline" size="sm" onClick={() => setDeleteTarget(product)} className="border-red-200 text-red-500 hover:bg-red-50">삭제</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 상품 추가 Dialog */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>상품 추가</DialogTitle>
            </DialogHeader>
            <div className="max-h-[65vh] overflow-y-auto py-4">
              <ProductForm
                form={form}
                onChange={handleFormChange}
                onBlockChange={handleBlockChange}
                onAddBlock={handleAddBlock}
                onRemoveBlock={handleRemoveBlock}
              />
              {formError && <p className="mt-3 text-sm text-red-500">{formError}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} disabled={isSubmitting}>취소</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "추가 중..." : "추가"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 상품 수정 Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null); }}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>상품 수정</DialogTitle>
              {editTarget && <p className="truncate text-sm text-gray-500">{editTarget.name}</p>}
            </DialogHeader>
            <div className="max-h-[65vh] overflow-y-auto py-4">
              <ProductForm
                form={form}
                onChange={handleFormChange}
                onBlockChange={handleBlockChange}
                onAddBlock={handleAddBlock}
                onRemoveBlock={handleRemoveBlock}
              />
              {formError && <p className="mt-3 text-sm text-red-500">{formError}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditTarget(null)} disabled={isSubmitting}>취소</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "수정 중..." : "수정"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 AlertDialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>상품 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{deleteTarget?.name}</span>을(를) 삭제할까요?
              <br />이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-red-500 hover:bg-red-600">
              {isSubmitting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
