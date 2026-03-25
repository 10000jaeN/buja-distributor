import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { adminAuthMiddleware } from "../../middleware/admin.middleware.js";
import {
  createProduct,
  getProducts,
  getProductBySlug,
  getCategories,
  patchProduct,
  deleteProduct,
} from "./product.controller.js";

const router = express.Router();

/**
 * @function checkProductSlug
 * @decs 라우트 미들웨어: URL 파라미터에서 'slug'를 추출하고 유효성을 검사합니다.
 */
const checkProductSlug = (req, res, next) => {
  const slug = req.params.slug;
  if (!slug) {
    const error = new Error("요청 경로에 Slug 파라미터가 누락되었습니다.");
    error.status = 400;
    return next(error);
  }
  req.slug = slug;
  next();
};

// ----------------------------------------------------
// 🛍️ 상품 목록 및 생성 라우트 (기본 경로: /products)
// ----------------------------------------------------

/**
 * @route GET /products
 * @decs 전체 상품 목록 조회
 * @access Public (All)
 */
router.get("/", asyncHandler(getProducts));
router.get("/categories", asyncHandler(getCategories));

/**
 * @route POST /products
 * @decs 새 상품 등록 (관리자 전용)
 * @access Private (Admin)
 * @body { name: string, price: number, description: string, category: string, imageUrls: string[], ... }
 */
router.post(
  "/",
  authMiddleware,
  adminAuthMiddleware,
  asyncHandler(createProduct)
);
// ----------------------------------------------------

/**
 * 🎯 개별 상품 관리 라우트 (경로: /products/:id)
 * @decs ID 유효성 검사 미들웨어를 먼저 적용합니다.
 */
router
  .route("/:slug")
  .all(checkProductSlug) // ID 유효성 검사 (모든 /:id 라우트에 적용)

  /**
   * @route GET /products/:id
   * @decs 특정 상품 상세 조회
   * @access Public (All)
   */
  .get(asyncHandler(getProductBySlug))

  /**
   * @route PATCH /products/:id
   * @decs 특정 상품 정보 수정 (관리자 전용)
   * @access Private (Admin)
   * @body { name?: string, price?: number, description?: string, ... }
   */
  .patch(authMiddleware, adminAuthMiddleware, asyncHandler(patchProduct))

  /**
   * @route DELETE /products/:id
   * @decs 특정 상품 삭제 (관리자 전용)
   * @access Private (Admin)
   */
  .delete(authMiddleware, adminAuthMiddleware, asyncHandler(deleteProduct));

export default router;
