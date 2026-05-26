import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  createReview,
  deleteReview,
  getProductReviews,
} from "./review.controller.js";

const router = express.Router();

/**
 * @function checkReviewId
 * @decs 라우트 미들웨어: URL 파라미터에서 'reviewId' 유효성을 검사합니다.
 */
const checkReviewId = (req, res, next) => {
  const { reviewId } = req.params;
  if (!reviewId) {
    const error = new Error("요청 경로에 Review ID 파라미터가 누락되었습니다.");
    error.status = 400;
    return next(error);
  }
  next();
};

// ----------------------------------------------------
// 💬 리뷰 생성 및 조회 라우트 (기본 경로: /reviews)
// ----------------------------------------------------

/**
 * @route POST /reviews
 * @decs 새 리뷰 등록
 * @access Private (User)
 * @body { productId: string, rating: number, content: string, images?: string[] }
 */
router.post("/", authMiddleware, asyncHandler(createReview));

/**
 * @route GET /reviews/:productId
 * @decs 특정 상품의 전체 리뷰 목록 조회
 * @access Public (All)
 */
router.get("/:productId", asyncHandler(getProductReviews));

// ----------------------------------------------------
// 🎯 개별 리뷰 관리 라우트 (경로: /reviews/:reviewId)
// ----------------------------------------------------

/**
 * @route DELETE /reviews/:reviewId
 * @decs 특정 리뷰 삭제 (작성자 본인 전용)
 * @access Private (User)
 */
router.delete(
  "/:reviewId",
  authMiddleware,
  checkReviewId,
  asyncHandler(deleteReview)
);

export default router;
