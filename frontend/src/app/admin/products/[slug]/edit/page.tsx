"use client";

import { categoryService } from "@/api/categoryService";
import { productService } from "@/api/productService";
import { Button } from "@/components/ui/button";
import { Category } from "@/types/product";
import { ChevronLeft, Eye } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  INITIAL_FORM,
  ProductForm,
  type ProductFormData,
  type ShippingType,
} from "../../_components/ProductForm";

function buildPayload(f: ProductFormData) {
  const isFree = f.shippingType === "free";
  const isBundle = f.shippingType === "bundle";
  return {
    name: f.name,
    price: Number(f.price),
    shippingFee: isFree ? 0 : Number(f.shippingFee),
    freeShippingThreshold: isBundle ? Number(f.freeShippingThreshold) : 0,
    bundleShipping: isBundle,
    category: { parent: f.categoryParent, child: f.categoryChild },
    thumbnail: f.thumbnail ? [f.thumbnail] : [],
    isAvailable: f.isAvailable,
    content: f.content,
  };
}

export default function ProductEditPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductFormData>(INITIAL_FORM);
  const [productName, setProductName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      productService.getProductBySlug(slug),
      categoryService.getCategories().catch(() => [] as Category[]),
    ])
      .then(([product, cats]) => {
        setCategories(cats);
        if (!product) {
          toast.error("상품을 찾을 수 없습니다.");
          router.push("/admin/products");
          return;
        }
        setProductName(product.name);
        const shippingType: ShippingType =
          product.shippingFee === 0
            ? "free"
            : product.bundleShipping
              ? "bundle"
              : "paid";
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
          content: product.content || "",
        });
      })
      .catch(() => {
        toast.error("상품 정보를 불러오는 데 실패했습니다.");
        router.push("/admin/products");
      })
      .finally(() => setIsLoading(false));
  }, [slug, router]);

  const handleFormChange = (
    field: keyof ProductFormData,
    value: string | boolean,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePreview = () => {
    sessionStorage.setItem("product-preview-data", JSON.stringify(form));
    window.open("/preview", "_blank");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error("입력 오류", {
        description: "상품명과 가격은 필수 항목입니다.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await productService.updateProduct(slug, buildPayload(form));
      toast.success("상품이 수정됐습니다.");
      router.push("/admin/products");
    } catch (err: unknown) {
      const status = (err as Error & { status?: number })?.status;
      const serverMsg = (err as Error)?.message;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="border-t-brand-blue h-8 w-8 animate-spin rounded-full border-3 border-gray-200" />
          <span className="text-sm text-gray-500">불러오는 중...</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">상품 수정</h1>
            {productName && (
              <p className="mt-0.5 text-sm text-gray-400">{productName}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4" />
            미리보기
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "수정 중..." : "수정 저장"}
          </Button>
        </div>
      </div>

      {/* 폼 */}
      <div className="max-w-full">
        <ProductForm
          form={form}
          onChange={handleFormChange}
          categories={categories}
        />
      </div>
    </form>
  );
}
