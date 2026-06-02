import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  createReview,
  deleteReview,
  getMyReviews,
  getProductReviews,
  updateReview,
} from "./review.controller.js";

const router = express.Router();

/**
 * @route GET /reviews/my
 * @desc  로그인한 유저의 리뷰 목록 조회
 * @access Private
 */
router.get("/my", authMiddleware, asyncHandler(getMyReviews));

/**
 * @route POST /reviews
 * @desc  리뷰 등록
 * @access Private
 * @body  { productId, orderId?, rating, content, images? }
 */
router.post("/", authMiddleware, asyncHandler(createReview));

/**
 * @route GET /reviews/:productId
 * @desc  특정 상품의 리뷰 목록 조회
 * @access Public
 */
router.get("/:productId", asyncHandler(getProductReviews));

/**
 * @route PATCH /reviews/:reviewId
 * @desc  리뷰 수정 (본인만)
 * @access Private
 */
router.patch("/:reviewId", authMiddleware, asyncHandler(updateReview));

/**
 * @route DELETE /reviews/:reviewId
 * @desc  리뷰 삭제 (본인만)
 * @access Private
 */
router.delete("/:reviewId", authMiddleware, asyncHandler(deleteReview));

export default router;
