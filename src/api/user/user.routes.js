import express from "express";
import { deleteUser } from "./user.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";

const router = express.Router();

// DELETE /api/user/delete - 회원 탈퇴 (반드시 미들웨어 보호 필요)
// 💡 미들웨어를 적용하여 deleteUser 컨트롤러 실행 전에 인증을 확인합니다.
router.delete("/delete", authMiddleware, deleteUser);

export default router;
