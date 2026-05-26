import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import { getSettings, updateSettings } from "./settings.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { adminAuthMiddleware } from "../../middleware/admin.middleware.js";

const router = express.Router();

// GET /settings — 공개 (장바구니 등 프론트에서 호출)
router.get("/", asyncHandler(getSettings));

// PATCH /settings — 어드민 전용
router.patch("/", authMiddleware, adminAuthMiddleware, asyncHandler(updateSettings));

export default router;
