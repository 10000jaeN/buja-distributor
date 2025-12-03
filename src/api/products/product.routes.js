import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import { authMiddleware } from "../../middleware/auth.middleware.js"; // 인증 미들웨어
import { adminAuthMiddleware } from "../../middleware/admin.middleware.js"; // 💡 관리자 미들웨어
import {
  createProduct, // 💡 새 상품 등록 함수 임포트
  getProducts,
  getProductById,
  patchProduct,
  deleteProduct,
} from "./product.controller.js";

const router = express.Router();

/**
 * @function checkProductId
 * @decs 라우트 미들웨어: URL 파라미터에서 'id'를 추출하고 유효성을 검사합니다.
 */
const checkProductId = (req, res, next) => {
  const id = req.params.id;
  if (!id) {
    const error = new Error("요청 경로에 ID 파라미터가 누락되었습니다.");
    error.status = 400;
    return next(error);
  }
  req.productId = id;
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
  .route("/:id")
  .all(checkProductId) // ID 유효성 검사 (모든 /:id 라우트에 적용)

  /**
   * @route GET /products/:id
   * @decs 특정 상품 상세 조회
   * @access Public (All)
   */
  .get(asyncHandler(getProductById))

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
