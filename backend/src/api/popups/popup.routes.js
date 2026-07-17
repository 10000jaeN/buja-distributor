import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { adminAuthMiddleware } from "../../middleware/admin.middleware.js";
import {
  getActivePopups,
  getAllPopups,
  createPopup,
  updatePopup,
  deletePopup,
} from "./popup.controller.js";

const router = express.Router();

// 공개 — 활성 팝업 조회 (홈페이지에서 사용)
router.get("/active", asyncHandler(getActivePopups));

// 어드민 전용
router.get("/", authMiddleware, adminAuthMiddleware, asyncHandler(getAllPopups));
router.post("/", authMiddleware, adminAuthMiddleware, asyncHandler(createPopup));
router.patch("/:id", authMiddleware, adminAuthMiddleware, asyncHandler(updatePopup));
router.delete("/:id", authMiddleware, adminAuthMiddleware, asyncHandler(deletePopup));

export default router;
