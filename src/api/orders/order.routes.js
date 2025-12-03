import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
} from "../../api/orders/order.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { adminAuthMiddleware } from "../../middleware/admin.middleware.js";

const router = express.Router();

/**
 * 💡 모든 주문 관련 라우트는 인증이 필요합니다.
 * authMiddleware를 라우터의 모든 경로에 먼저 적용합니다.
 */
router.use(authMiddleware);

// --- 관리자 전용 주문 관련 라우트 ---

// 1. GET /api/orders/all (전체 주문 목록 조회 - 관리자 전용)
// 🚨 adminAuthMiddleware가 먼저 실행되어 관리자 권한이 있는지 확인합니다.
router.get("/all", adminAuthMiddleware, asyncHandler(getAllOrders));

// --- 사용자 주문 관련 라우트 ---

// 1. POST /api/orders (새 주문 생성)
// /api/orders 경로에 요청 본문(items, shippingAddress)을 보내면 주문이 생성됩니다.
router.post("/", asyncHandler(createOrder));

// 2. GET /api/orders (본인 주문 목록 조회)
// 인증된 사용자(user)의 모든 주문 목록을 조회합니다.
router.get("/", asyncHandler(getMyOrders));

// 3. GET /api/orders/:id (특정 주문 상세 조회)
// 인증된 사용자(user)의 특정 주문 1개를 조회합니다.
router.get("/:id", asyncHandler(getOrderById));

export default router;
