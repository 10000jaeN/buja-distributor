import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import authMiddleware from "../../middleware/auth.middleware.js";
import adminAuthMiddleware from "../../middleware/admin.middleware.js";
import {
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from "./coupon.controller.js";

const router = express.Router();

// 유저 — 쿠폰 유효성 검사
router.post("/validate", authMiddleware, asyncHandler(validateCoupon));

// 어드민 전용
router.get("/", authMiddleware, adminAuthMiddleware, asyncHandler(getAllCoupons));
router.post("/", authMiddleware, adminAuthMiddleware, asyncHandler(createCoupon));
router.patch("/:id", authMiddleware, adminAuthMiddleware, asyncHandler(updateCoupon));
router.delete("/:id", authMiddleware, adminAuthMiddleware, asyncHandler(deleteCoupon));

export default router;
