import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  getProducts,
  getProductById,
  patchProduct,
  deleteProduct,
} from "./product.controller.js"; // 💡 컨트롤러 함수 임포트

const router = express.Router();

/**
 * 💡 라우트 미들웨어: URL 파라미터에서 ID를 추출하고 유효성을 검사합니다.
 * 이 미들웨어는 라우팅 로직의 일부로 간주하여 라우터 파일에 유지합니다.
 */
const checkProductId = (req, res, next) => {
  const id = req.params.id;

  // 1. 유효성 검사
  if (!id) {
    const error = new Error("요청 경로에 ID 파라미터가 누락되었습니다.");
    error.status = 400; // Bad Request
    return next(error);
  }

  // 2. req 객체에 저장
  req.productId = id;

  // 3. 다음 핸들러로 넘어갑니다.
  next();
};

// GET / - 상품 목록 전체 조회 (컨트롤러 함수 연결)
router.get("/", asyncHandler(getProducts));

// GET, PATCH, DELETE /:id - 특정 상품 관련 라우트
router
  .route("/:id")
  .all(checkProductId) // ID 유효성 검사

  .get(asyncHandler(getProductById)) // 상세 조회 컨트롤러 연결
  .patch(asyncHandler(patchProduct)) // 부분 수정 컨트롤러 연결
  .delete(asyncHandler(deleteProduct)); // 삭제 컨트롤러 연결

export default router;
