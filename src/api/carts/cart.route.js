import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  getCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItems,
} from "./cart.controller.js";

const router = express.Router();

// 모든 장바구니 라우트에 인증 미들웨어 적용
// authMiddleware가 성공적으로 사용자를 인증하면 req.user에 { id, roles }를 설정합니다.
router.use(authMiddleware);

/**
 * @route GET /carts
 * @desc 현재 로그인된 사용자의 장바구니 내용을 조회
 * @access Private (인증 필수)
 */
router.get("/", asyncHandler(getCart));

/**
 * @route POST /carts/item
 * @desc 장바구니에 상품을 추가하거나 이미 존재할 경우 추가
 * @access Private (인증 필수)
 * @body { productId: string, quantity: number }
 */
router.post("/item", asyncHandler(addItemToCart));

/**
 * @route PATCH /carts/:productId
 * @desc 장바구니에 기존 상품 수량을 변경
 * @access Private (인증 필수)
 * @body { quantity: number }
 */
router.patch("/:productId", asyncHandler(updateCartItemQuantity));

/**
 * @route DELETE /carts/item/remove-items
 * @desc 장바구니에서 특정 상품을 제거
 * @access Private (인증 필수)
 * @body { productId: string[] }
 */
router.delete("/item/remove-items", asyncHandler(removeCartItems));

export default router;
