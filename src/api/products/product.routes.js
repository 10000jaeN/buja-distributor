import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import { authMiddleware } from "../../middleware/auth.middleware.js"; // 인증 미들웨어
import { adminMiddleware } from "../../middleware/admin.middleware.js"; // 💡 관리자 미들웨어
import {
  createProduct, // 💡 새 상품 등록 함수 임포트
  getProducts,
  getProductById,
  patchProduct,
  deleteProduct,
} from "./product.controller.js";

const router = express.Router();

/**
 * 라우트 미들웨어: URL 파라미터에서 ID를 추출하고 유효성을 검사합니다.
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
// GET / - 상품 목록 전체 조회 (인증/권한 불필요)
router.get("/", asyncHandler(getProducts));

// POST / - 새 상품 등록 (인증 + 관리자 권한 필요)
router.post("/", authMiddleware, adminMiddleware, asyncHandler(createProduct));
// ----------------------------------------------------

// GET, PATCH, DELETE /:id - 특정 상품 관련 라우트
router
  .route("/:id")
  .all(checkProductId) // ID 유효성 검사 (모두 적용)

  // GET /:id - 특정 상품 상세 조회 (인증/권한 불필요)
  .get(asyncHandler(getProductById))

  // PATCH /:id - 특정 상품 정보 수정 (인증 + 관리자 권한 필요)
  .patch(authMiddleware, adminMiddleware, asyncHandler(patchProduct))

  // DELETE /:id - 특정 상품 삭제 (인증 + 관리자 권한 필요)
  .delete(authMiddleware, adminMiddleware, asyncHandler(deleteProduct));

export default router;
