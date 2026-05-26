"use client";

import { categoryService } from "@/api/categoryService";
import { productService } from "@/api/productService";
import { Button } from "@/components/ui/button";
import { Category } from "@/types/product";
import { ChevronLeft, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  INITIAL_FORM,
  ProductForm,
  type ProductFormData,
} from "../_components/ProductForm";

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

export default function ProductNewPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductFormData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    categoryService
      .getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

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
      await productService.createProduct(buildPayload(form));
      toast.success("상품이 추가됐습니다.");
      router.push("/admin/products");
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
          <h1 className="text-xl font-bold text-gray-900">상품 추가</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4" />
            미리보기
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "추가 중..." : "상품 추가"}
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
