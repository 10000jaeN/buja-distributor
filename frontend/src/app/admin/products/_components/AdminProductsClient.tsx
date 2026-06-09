"use client";

import { productService } from "@/api/productService";
import { categoryService } from "@/api/categoryService";
import { Category, Product } from "@/types/product";
import { Button } from "@/components/ui/button";
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
import { useRouter } from "next/navigation";
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

export default function AdminProductsClient() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    categoryService.getCategories().then(setCategories).catch(() => {});
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await productService.deleteProductBySlug(deleteTarget.slug);
      setDeleteTarget(null);
      await fetchProducts();
      toast.success("상품이 삭제됐습니다.");
    } catch (err: unknown) {
      const status = (err as Error & { status?: number })?.status;
      if (status === 403)
        toast.error("권한 오류", { description: "관리자 권한이 필요합니다." });
      else
        toast.error("상품 삭제 실패", {
          description: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        });
    } finally {
      setIsDeleting(false);
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
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = filterCategory === "all" || p.category.parent === filterCategory;
    const matchChild = filterChild === "all" || p.category.child === filterChild;
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
        <Button onClick={() => router.push("/admin/products/new")}>
          + 상품 추가
        </Button>
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

      {/* 검색 및 필터 */}
      {!isLoading && !error && (
        <div className="mb-4 space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="상품명 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-white"
            />
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterCategory("all");
                setFilterChild("all");
                setFilterStatus("all");
              }}
              className="flex shrink-0 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-400 hover:text-gray-600"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">초기화</span>
            </button>
          </div>

          <div className="flex gap-2">
            <Select
              value={filterCategory}
              onValueChange={(v) => {
                if (!v) return;
                setFilterCategory(v);
                setFilterChild("all");
              }}
            >
              <SelectTrigger className="flex-1 bg-white lg:w-40 lg:flex-none">
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
              <SelectTrigger className="flex-1 bg-white lg:w-36 lg:flex-none">
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
              <SelectTrigger className="flex-1 bg-white lg:w-36 lg:flex-none">
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
        </div>
      )}

      {/* 상품 목록 */}
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
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white py-12 text-center text-sm text-gray-400 shadow-sm">
          {products.length === 0 ? "등록된 상품이 없습니다." : "검색 결과가 없습니다."}
        </div>
      ) : (
        <>
          {/* 모바일/태블릿: 카드 목록 */}
          <div className="flex flex-col gap-3 lg:hidden">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
              >
                <Image
                  src={product.thumbnail[0] ?? noImage}
                  alt={product.name}
                  width={56}
                  height={56}
                  className="h-21.5 w-21.5 shrink-0 rounded-md border border-gray-200 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-sm font-semibold">
                    {product.name}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-700">
                    {product.price.toLocaleString()}원
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {product.category.parent}
                    {product.category.child ? ` / ${product.category.child}` : ""}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${product.isAvailable ? "text-brand-blue bg-blue-50" : "bg-gray-100 text-gray-500"}`}
                    >
                      {product.isAvailable ? "재고 있음" : "품절"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(product.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/products/${product.slug}/edit`)}
                    className="text-xs"
                  >
                    수정
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteTarget(product)}
                    className="border-red-200 text-xs text-red-500 hover:bg-red-50"
                  >
                    삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* 데스크탑: 테이블 */}
          <div className="hidden overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm lg:block">
            <table className="w-full min-w-[700px] divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["", "상품명", "가격", "카테고리", "재고", "등록일", "관리"].map(
                    (col, i, arr) => (
                      <th
                        key={i}
                        className={`px-4 py-3 text-left text-xs font-semibold tracking-wide whitespace-nowrap text-gray-500 uppercase ${i === arr.length - 1 ? "pr-2" : ""}`}
                      >
                        {col}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr
                    key={product._id}
                    className="transition-colors duration-150 hover:bg-gray-50"
                  >
                    <td className="w-18 min-w-18 px-4 py-2">
                      <Image
                        src={product.thumbnail[0] ?? noImage}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-md border border-gray-200 object-cover"
                      />
                    </td>
                    <td className="text-foreground max-w-40 truncate px-4 py-3 text-sm font-medium">
                      {product.name}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-700">
                      {product.price.toLocaleString()}원
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-700">
                      {product.category.parent}
                      {product.category.child ? ` / ${product.category.child}` : ""}
                    </td>
                    <td className="w-24 px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${product.isAvailable ? "text-brand-blue bg-blue-50" : "bg-gray-100 text-gray-500"}`}
                      >
                        {product.isAvailable ? "재고 있음" : "품절"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-500">
                      {formatDate(product.createdAt)}
                    </td>
                    <td className="w-28 px-4 py-3 pr-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/admin/products/${product.slug}/edit`)
                          }
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
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>상품 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="text-foreground font-medium">
                {deleteTarget?.name}
              </span>
              을(를) 삭제할까요?
              <br />이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
