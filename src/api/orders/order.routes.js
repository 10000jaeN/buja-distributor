import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  completePayment,
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
 * authMiddleware를 라우터의 모든 경로에 먼저 적용합니다.
 */
router.use(authMiddleware);

// =================================================================
// ⚙️ 관리자 주문 처리 및 배송 자동화 관련 라우트 (관리자 권한 필요)
// =================================================================

// GET /api/orders/all - 전체 주문 목록 조회 (관리자 전용)
router.get("/all", adminAuthMiddleware, asyncHandler(getAllOrders));

// PATCH /api/orders/:id/prepare - 상품 준비 시작 (상태: paid -> processing)
router.patch(
  "/:id/prepare",
  adminAuthMiddleware, // authMiddleware는 router.use로 이미 적용됨
  asyncHandler(startPreparation)
);

// PATCH /api/orders/:id/shipping - [배송 중] 처리: 송장번호 등록 (상태: processing -> shipped)
router.patch(
  "/:id/shipping",
  adminAuthMiddleware,
  asyncHandler(startShipping) // 💡 함수 이름 변경 반영
);

// PATCH /api/orders/:id/complete - [배송 완료] 처리 (상태: shipped -> delivered)
router.patch(
  "/:id/complete",
  adminAuthMiddleware,
  asyncHandler(completeDelivery)
);

// =================================================================
// 🛍️ 일반 사용자 주문 관련 라우트 (로그인 필요 - router.use로 처리)
// =================================================================

// POST /api/orders - 1. 새 주문 생성 (결제 대기 상태: pending)
router.post("/", asyncHandler(createOrder));

// GET /api/orders - 2. 내 주문 목록 조회
router.get("/", asyncHandler(getMyOrders));

// GET /api/orders/:id - 3. 특정 주문 상세 조회
router.get("/:id", asyncHandler(getOrderById));

// PATCH /api/orders/:id/pay - 4. 주문 결제 완료 처리 (상태: pending -> paid)
router.patch("/:id/pay", asyncHandler(completePayment));

// PATCH /api/orders/:id/cancel - 5. 주문 취소 처리 (상태: pending/paid/processing -> cancelled)
router.patch("/:id/cancel", asyncHandler(cancelOrder)); // 💡 주문 취소 라우트 추가

export default router;
