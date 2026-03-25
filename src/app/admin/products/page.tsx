"use client";

import { productService } from "@/api/productService";
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

// ─── 모달 공통 오버레이 ────────────────────────────────────────────────────────
function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

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
  onBlockChange: (
    index: number,
    field: keyof ContentBlock,
    value: string,
  ) => void;
  onAddBlock: () => void;
  onRemoveBlock: (index: number) => void;
}) {
  return (
    <div className="space-y-4">
      {/* 상품명 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          상품명 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="상품명을 입력하세요"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition-colors duration-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
          required
        />
      </div>

      {/* 가격 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          가격 (원) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={form.price}
          onChange={(e) => onChange("price", e.target.value)}
          placeholder="0"
          min="0"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition-colors duration-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
          required
        />
      </div>

      {/* 카테고리 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            카테고리 (부모)
          </label>
          <input
            type="text"
            value={form.categoryParent}
            onChange={(e) => onChange("categoryParent", e.target.value)}
            placeholder="예: 장류"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition-colors duration-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            카테고리 (자식)
          </label>
          <input
            type="text"
            value={form.categoryChild}
            onChange={(e) => onChange("categoryChild", e.target.value)}
            placeholder="예: 된장"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition-colors duration-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
          />
        </div>
      </div>

      {/* 썸네일 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          썸네일 URL
        </label>
        <textarea
          value={form.thumbnail}
          onChange={(e) => onChange("thumbnail", e.target.value)}
          placeholder={"URL을 쉼표로 구분하여 입력\nhttps://..., https://..."}
          rows={2}
          className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition-colors duration-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
        />
      </div>

      {/* 재고 여부 */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">재고 여부</label>
        <button
          type="button"
          onClick={() => onChange("isAvailable", !form.isAvailable)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
            form.isAvailable ? "bg-brand-blue" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
              form.isAvailable ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className="text-sm text-gray-500">
          {form.isAvailable ? "재고 있음" : "품절"}
        </span>
      </div>

      {/* 콘텐츠 블록 */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            콘텐츠 블록
          </label>
          <button
            type="button"
            onClick={onAddBlock}
            className="rounded-md border border-brand-blue px-3 py-1 text-xs font-medium text-brand-blue transition-colors duration-200 hover:bg-blue-50"
          >
            + 블록 추가
          </button>
        </div>

        {form.contentBlocks.length === 0 && (
          <p className="rounded-md border border-dashed border-gray-300 py-4 text-center text-sm text-gray-400">
            블록이 없습니다. 블록 추가 버튼을 눌러주세요.
          </p>
        )}

        <div className="space-y-3">
          {form.contentBlocks.map((block, i) => (
            <div
              key={i}
              className="rounded-md border border-gray-200 bg-gray-50 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <select
                  value={block.type}
                  onChange={(e) => onBlockChange(i, "type", e.target.value)}
                  className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm outline-none focus:border-brand-blue"
                >
                  <option value="text">텍스트</option>
                  <option value="image">이미지</option>
                </select>
                <button
                  type="button"
                  onClick={() => onRemoveBlock(i)}
                  className="text-xs text-red-400 transition-colors duration-200 hover:text-red-600"
                >
                  삭제
                </button>
              </div>
              <textarea
                value={block.value}
                onChange={(e) => onBlockChange(i, "value", e.target.value)}
                placeholder={
                  block.type === "image" ? "이미지 URL 입력" : "텍스트 입력"
                }
                rows={2}
                className="w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition-colors duration-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
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

  // 모달 상태
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // 폼 상태
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ── 상품 목록 조회 ────────────────────────────────────────────────────────
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

  useEffect(() => {
    fetchProducts();
  }, []);

  // ── 폼 핸들러 ─────────────────────────────────────────────────────────────
  const handleFormChange = (
    field: keyof FormData,
    value: string | boolean,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlockChange = (
    index: number,
    field: keyof ContentBlock,
    value: string,
  ) => {
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
    thumbnail: f.thumbnail
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    isAvailable: f.isAvailable,
    contentBlocks: f.contentBlocks,
  });

  // ── 상품 추가 ─────────────────────────────────────────────────────────────
  const openCreateModal = () => {
    setForm(INITIAL_FORM);
    setFormError(null);
    setShowCreateModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      setFormError("상품명과 가격은 필수입니다.");
      return;
    }
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

  // ── 상품 수정 ─────────────────────────────────────────────────────────────
  const openEditModal = (product: Product) => {
    setForm({
      name: product.name,
      price: String(product.price),
      categoryParent: product.category.parent,
      categoryChild: product.category.child,
      thumbnail: product.thumbnail.join(", "),
      isAvailable: product.isAvailable,
      contentBlocks: product.contentBlock.map((b) => ({
        type: b.type,
        value: b.value,
      })),
    });
    setFormError(null);
    setEditTarget(product);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    if (!form.name || !form.price) {
      setFormError("상품명과 가격은 필수입니다.");
      return;
    }
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

  // ── 상품 삭제 ─────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await productService.deleteProductBySlug(deleteTarget.slug);
      setDeleteTarget(null);
      await fetchProducts();
    } catch {
      // 삭제 실패 시 모달 유지
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── 날짜 포맷 ─────────────────────────────────────────────────────────────
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };

  const totalCount = products.length;
  const availableCount = products.filter((p) => p.isAvailable).length;
  const soldOutCount = products.filter((p) => !p.isAvailable).length;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* 페이지 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">상품 관리</h1>
        <button
          onClick={openCreateModal}
          className="rounded-md bg-brand-blue px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-brand-blue-dark"
        >
          + 상품 추가
        </button>
      </div>

      {/* 스탯 카드 */}
      {!isLoading && !error && (
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: "총 상품", value: totalCount, color: "text-foreground" },
            { label: "판매 가능", value: availableCount, color: "text-brand-blue" },
            { label: "품절", value: soldOutCount, color: "text-gray-400" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-lg border border-gray-200 bg-white px-5 py-4 shadow-sm"
            >
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
          <button
            onClick={fetchProducts}
            className="mt-3 rounded-md border border-red-300 px-4 py-2 text-sm text-red-600 transition-colors duration-200 hover:bg-red-100"
          >
            다시 시도
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["상품명", "가격", "카테고리", "재고", "등록일", "관리"].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase"
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-sm text-gray-400"
                  >
                    등록된 상품이 없습니다.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product._id}
                    className="transition-colors duration-150 hover:bg-gray-50"
                  >
                    <td className="max-w-48 truncate px-4 py-3 text-sm font-medium text-foreground">
                      {product.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {product.price.toLocaleString()}원
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {product.category.parent}
                      {product.category.child
                        ? ` / ${product.category.child}`
                        : ""}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          product.isAvailable
                            ? "bg-blue-50 text-brand-blue"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {product.isAvailable ? "재고 있음" : "품절"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(product.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 transition-colors duration-200 hover:border-brand-blue hover:text-brand-blue"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-500 transition-colors duration-200 hover:bg-red-50"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── 상품 추가 모달 ──────────────────────────────────────────────────── */}
      {showCreateModal && (
        <ModalOverlay onClose={() => setShowCreateModal(false)}>
          <form onSubmit={handleCreate}>
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-base font-bold text-foreground">
                상품 추가
              </h2>
            </div>
            <div className="max-h-[65vh] overflow-y-auto px-6 py-4">
              <ProductForm
                form={form}
                onChange={handleFormChange}
                onBlockChange={handleBlockChange}
                onAddBlock={handleAddBlock}
                onRemoveBlock={handleRemoveBlock}
              />
              {formError && (
                <p className="mt-3 text-sm text-red-500">{formError}</p>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                disabled={isSubmitting}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-brand-blue px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-brand-blue-dark disabled:opacity-50"
              >
                {isSubmitting ? "추가 중..." : "추가"}
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* ── 상품 수정 모달 ──────────────────────────────────────────────────── */}
      {editTarget && (
        <ModalOverlay onClose={() => setEditTarget(null)}>
          <form onSubmit={handleUpdate}>
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-base font-bold text-foreground">
                상품 수정
              </h2>
              <p className="mt-0.5 truncate text-sm text-gray-500">
                {editTarget.name}
              </p>
            </div>
            <div className="max-h-[65vh] overflow-y-auto px-6 py-4">
              <ProductForm
                form={form}
                onChange={handleFormChange}
                onBlockChange={handleBlockChange}
                onAddBlock={handleAddBlock}
                onRemoveBlock={handleRemoveBlock}
              />
              {formError && (
                <p className="mt-3 text-sm text-red-500">{formError}</p>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                disabled={isSubmitting}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-brand-blue px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-brand-blue-dark disabled:opacity-50"
              >
                {isSubmitting ? "수정 중..." : "수정"}
              </button>
            </div>
          </form>
        </ModalOverlay>
      )}

      {/* ── 삭제 확인 모달 ──────────────────────────────────────────────────── */}
      {deleteTarget && (
        <ModalOverlay onClose={() => setDeleteTarget(null)}>
          <div className="px-6 py-6">
            <h2 className="text-base font-bold text-foreground">상품 삭제</h2>
            <p className="mt-3 text-sm text-gray-600">
              정말 삭제하시겠습니까?
            </p>
            <p className="mt-1 font-medium text-foreground">
              {deleteTarget.name}
            </p>
            <p className="mt-2 text-xs text-gray-400">
              이 작업은 되돌릴 수 없습니다.
            </p>
          </div>
          <div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-4">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={isSubmitting}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-600 disabled:opacity-50"
            >
              {isSubmitting ? "삭제 중..." : "삭제"}
            </button>
          </div>
        </ModalOverlay>
      )}
    </>
  );
}
