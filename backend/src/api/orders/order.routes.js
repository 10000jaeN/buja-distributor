import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  getOrderStats,
  getMonthlyStats,
  cancelOrder,
  startPreparation,
  startShipping,
  completeDelivery,
} from "./order.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { adminAuthMiddleware } from "../../middleware/admin.middleware.js";

const router = express.Router();

/**
 * 💡 모든 주문 관련 라우트는 인증이 필요합니다.
 * @desc 모든 요청에 대해 사용자 인증 (로그인 여부)을 확인합니다.
 */
router.use(authMiddleware);

// =================================================================
// ⚙️ 관리자 주문 처리 및 배송 자동화 관련 라우트 (관리자 권한 필요)
// =================================================================

/**
 * @route [GET] /orders/all
 * @desc 1. 전체 주문 목록 조회 (관리자 전용)
 * @access Private (Admin)
 */
router.get("/all", adminAuthMiddleware, asyncHandler(getAllOrders));
router.get("/stats", adminAuthMiddleware, asyncHandler(getOrderStats));
router.get("/monthly-stats", adminAuthMiddleware, asyncHandler(getMonthlyStats));

/**
 * @route [PATCH] /orders/:id/prepare
 * @desc 2. 상품 준비 시작 처리 (상태: paid -> processing)
 * @access Private (Admin)
 */
router.patch(
  "/:id/prepare",
  adminAuthMiddleware, // authMiddleware는 router.use로 이미 적용됨
  asyncHandler(startPreparation)
);

/**
 * @route [PATCH] /orders/:id/shipping
 * @desc 3. [배송 중] 처리: 송장번호 등록 (상태: processing -> shipped)
 * @access Private (Admin)
 * @body { courierName: string, trackingNumber: string }
 */
router.patch("/:id/shipping", adminAuthMiddleware, asyncHandler(startShipping));

/**
 * @route [PATCH] /orders/:id/complete
 * @desc 4. [배송 완료] 처리 (상태: shipped -> delivered)
 * @access Private (Admin)
 */
router.patch(
  "/:id/complete",
  adminAuthMiddleware,
  asyncHandler(completeDelivery)
);

// =================================================================
// 🛍️ 일반 사용자 주문 관련 라우트 (로그인 필요 - router.use로 처리)
// =================================================================

/**
 * @route [POST] /orders
 * @desc 5. 새 주문 생성 (결제 대기 상태: pending)
 * @access Private (User)
 */
router.post("/", asyncHandler(createOrder));

/**
 * @route [GET] /orders
 * @desc 6. 내 주문 목록 조회
 * @access Private (User)
 */
router.get("/", asyncHandler(getMyOrders));

/**
 * @route [GET] /api/orders/:id
 * @desc 7. 특정 주문 상세 조회
 * @access Private (User, 자신의 주문만 조회 가능)
 */
router.get("/:id", asyncHandler(getOrderById));

/**
 * @route [PATCH] /api/orders/:id/cancel
 * @desc 9. 주문 취소 처리 (상태: pending/paid/processing -> cancelled)
 * @access Private (User)
 */
router.patch("/:id/cancel", asyncHandler(cancelOrder));

export default router;
