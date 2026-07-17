import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { adminAuthMiddleware } from "../../middleware/admin.middleware.js";
import {
  getAllPromotions,
  getActivePromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from "./promotion.controller.js";

const router = express.Router();

// 공개 — 활성 프로모션 조회 (결제 페이지에서 사용)
router.get("/active", asyncHandler(getActivePromotions));

// 어드민 전용
router.get("/", authMiddleware, adminAuthMiddleware, asyncHandler(getAllPromotions));
router.post("/", authMiddleware, adminAuthMiddleware, asyncHandler(createPromotion));
router.patch("/:id", authMiddleware, adminAuthMiddleware, asyncHandler(updatePromotion));
router.delete("/:id", authMiddleware, adminAuthMiddleware, asyncHandler(deletePromotion));

export default router;
