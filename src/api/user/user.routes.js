import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  deleteUser,
  getUserProfile,
  patchUser,
  getAllUsers,
} from "./user.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { adminAuthMiddleware } from "../../middleware/admin.middleware.js";

const router = express.Router();

// ----------------------------------------------------
// 👤 사용자 프로필 조회 및 수정 라우트 (기본 경로: /user)
// ----------------------------------------------------

/**
 * @route GET /
 * @decs 1. 인증된 사용자의 프로필 정보 조회
 * @access Private (User)
 */
router.get("/", authMiddleware, asyncHandler(getUserProfile));

/**
 * @route PATCH /
 * @decs 2. 인증된 사용자의 프로필 정보 수정
 * @access Private (User)
 * @body { nickname?: string, address?: string, ... }
 */
router.patch("/", authMiddleware, asyncHandler(patchUser));

/**
 * @route DELETE /delete
 * @decs 3. 회원 탈퇴
 * @access Private (User)
 */
router.delete("/delete", authMiddleware, asyncHandler(deleteUser));

/**
 * @route GET /admin/all
 * @decs 관리자용: 전체 사용자 목록 조회
 * @access Private (Admin Only)
 */
router.get(
  "/admin/all",
  authMiddleware,
  adminAuthMiddleware,
  asyncHandler(getAllUsers)
);

export default router;
