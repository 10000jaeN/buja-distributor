"use client";

import { productService } from "@/api/productService";
import { categoryService } from "@/api/categoryService";
import { Category, Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { ProductDialogs } from "./_components/ProductDialogs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import noImage from "@/public/images/no-image.png";
import {
  ContentBlock,
  INITIAL_FORM,
  type ProductFormData,
  type ShippingType,
} from "./_components/ProductForm";

// ─── 메인 페이지 ──────────────────────────────────────────────────────────────
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const [form, setForm] = useState<ProductFormData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    categoryService
      .getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  const handleFormChange = (field: keyof ProductFormData, value: string | boolean) => {
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

  const buildPayload = (f: ProductFormData) => {
    const isFree = f.shippingType === "free";
    const isBundle = f.shippingType === "bundle";
    return {
      name: f.name,
      price: Number(f.price),
      shippingFee: isFree ? 0 : Number(f.shippingFee),
      freeShippingThreshold: isBundle ? Number(f.freeShippingThreshold) : 0,
      bundleShipping: isBundle,
      category: { parent: f.categoryParent, child: f.categoryChild },
      thumbnail: f.thumbnail
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      isAvailable: f.isAvailable,
      contentBlock: f.contentBlocks,
    };
  };

  const openCreateModal = () => {
    setForm(INITIAL_FORM);
    setShowCreateModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error("입력 오류", {
        description: "상품명과 가격은 필수 항목입니다.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await productService.createProduct(buildPayload(form));
      setShowCreateModal(false);
      await fetchProducts();
      toast.success("상품이 추가됐습니다.");
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      const serverMsg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      if (status === 401)
        toast.error("인증 오류", {
          description: "로그인이 만료됐습니다. 다시 로그인해 주세요.",
        });
      else if (status === 403)
        toast.error("권한 오류", { description: "관리자 권한이 필요합니다." });
      else if (status === 400)
        toast.error("요청 오류", {
          description: serverMsg ?? "입력값을 확인해 주세요.",
        });
      else
        toast.error("상품 추가 실패", {
          description:
            serverMsg ??
            "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (product: Product) => {
    const shippingType: ShippingType =
      product.shippingFee === 0 ? "free" :
      product.bundleShipping ? "bundle" : "paid";
    setForm({
      name: product.name,
      price: String(product.price),
      shippingType,
      shippingFee: String(product.shippingFee ?? 3000),
      freeShippingThreshold: String(product.freeShippingThreshold ?? 0),
      categoryParent: product.category.parent,
      categoryChild: product.category.child,
      thumbnail: product.thumbnail.join(", "),
      isAvailable: product.isAvailable,
      contentBlocks: product.contentBlock.map((b) => ({
        type: b.type,
        value: b.value,
      })),
    });
    setEditTarget(product);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    if (!form.name || !form.price) {
      toast.error("입력 오류", {
        description: "상품명과 가격은 필수 항목입니다.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await productService.updateProduct(editTarget.slug, buildPayload(form));
      setEditTarget(null);
      await fetchProducts();
      toast.success("상품이 수정됐습니다.");
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      const serverMsg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      if (status === 401)
        toast.error("인증 오류", {
          description: "로그인이 만료됐습니다. 다시 로그인해 주세요.",
        });
      else if (status === 403)
        toast.error("권한 오류", { description: "관리자 권한이 필요합니다." });
      else if (status === 400)
        toast.error("요청 오류", {
          description: serverMsg ?? "입력값을 확인해 주세요.",
        });
      else
        toast.error("상품 수정 실패", {
          description:
            serverMsg ??
            "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        });
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
      toast.success("상품이 삭제됐습니다.");
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 403)
        toast.error("권한 오류", { description: "관리자 권한이 필요합니다." });
      else
        toast.error("상품 삭제 실패", {
          description: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterChild, setFilterChild] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const selectedCategoryChildren =
    filterCategory === "all"
      ? []
      : (categories.find((c) => c.parent === filterCategory)?.children ?? []);

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchCategory =
      filterCategory === "all" || p.category.parent === filterCategory;
    const matchChild =
      filterChild === "all" || p.category.child === filterChild;
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "available" && p.isAvailable) ||
      (filterStatus === "soldout" && !p.isAvailable);
    return matchSearch && matchCategory && matchChild && matchStatus;
  });

  const totalCount = products.length;
  const availableCount = products.filter((p) => p.isAvailable).length;
  const soldOutCount = products.filter((p) => !p.isAvailable).length;

  return (
    <>
      {/* 페이지 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-foreground text-xl font-bold">상품 관리</h1>
        <Button
          onClick={openCreateModal}
        >
          + 상품 추가
        </Button>
      </div>

      {/* 스탯 카드 */}
      {!isLoading && !error && (
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: "총 상품", value: totalCount, color: "text-foreground" },
            {
              label: "판매 가능",
              value: availableCount,
              color: "text-brand-blue",
            },
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

      {/* 검색 및 필터 */}
      {!isLoading && !error && (
        <div className="mb-4 space-y-2">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="상품명 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-white"
            />
            <Select
              value={filterCategory}
              onValueChange={(v) => {
                if (!v) return;
                setFilterCategory(v);
                setFilterChild("all");
              }}
            >
              <SelectTrigger className="bg-white sm:w-40">
                <SelectValue>
                  {filterCategory === "all" ? "전체 카테고리" : filterCategory}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 카테고리</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.parent} value={cat.parent}>
                    {cat.parent}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterChild}
              onValueChange={(v) => v && setFilterChild(v)}
            >
              <SelectTrigger className="bg-white sm:w-36">
                <SelectValue>
                  {filterChild === "all" ? "전체 소분류" : filterChild}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 소분류</SelectItem>
                {selectedCategoryChildren.map((child) => (
                  <SelectItem key={child} value={child}>
                    {child}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterStatus}
              onValueChange={(v) => v && setFilterStatus(v)}
            >
              <SelectTrigger className="bg-white sm:w-36">
                <SelectValue>
                  {filterStatus === "all"
                    ? "전체 상태"
                    : filterStatus === "available"
                      ? "재고 있음"
                      : "품절"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 상태</SelectItem>
                <SelectItem value="available">재고 있음</SelectItem>
                <SelectItem value="soldout">품절</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterCategory("all");
                setFilterChild("all");
                setFilterStatus("all");
              }}
              className="mr-2 flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              필터 초기화
            </button>
          </div>
        </div>
      )}

      {/* 상품 테이블 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="border-t-brand-blue h-8 w-8 animate-spin rounded-full border-3 border-gray-200" />
            <span className="text-sm text-gray-500">불러오는 중...</span>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-10 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <Button
            variant="outline"
            onClick={fetchProducts}
            className="mt-3 border-red-300 text-red-600 hover:bg-red-100"
          >
            다시 시도
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "",
                  "상품명",
                  "가격",
                  "카테고리",
                  "재고",
                  "등록일",
                  "관리",
                ].map((col, i, arr) => (
                  <th
                    key={i}
                    className={`px-4 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase ${i === arr.length - 1 ? "pr-2" : ""}`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-sm text-gray-400"
                  >
                    {products.length === 0
                      ? "등록된 상품이 없습니다."
                      : "검색 결과가 없습니다."}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product._id}
                    className="transition-colors duration-150 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2">
                      <Image
                        src={product.thumbnail[0] ?? noImage}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-md border border-gray-200 object-cover"
                      />
                    </td>
                    <td className="text-foreground max-w-48 truncate px-4 py-3 text-sm font-medium">
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
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${product.isAvailable ? "text-brand-blue bg-blue-50" : "bg-gray-100 text-gray-500"}`}
                      >
                        {product.isAvailable ? "재고 있음" : "품절"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(product.createdAt)}
                    </td>
                    <td className="px-4 py-3 pr-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(product)}
                        >
                          수정
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteTarget(product)}
                          className="border-red-200 text-red-500 hover:bg-red-50"
                        >
                          삭제
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <ProductDialogs
        showCreateModal={showCreateModal}
        setShowCreateModal={setShowCreateModal}
        handleCreate={handleCreate}
        editTarget={editTarget}
        setEditTarget={setEditTarget}
        handleUpdate={handleUpdate}
        deleteTarget={deleteTarget}
        setDeleteTarget={setDeleteTarget}
        handleDelete={handleDelete}
        form={form}
        onChange={handleFormChange}
        onBlockChange={handleBlockChange}
        onAddBlock={handleAddBlock}
        onRemoveBlock={handleRemoveBlock}
        categories={categories}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
