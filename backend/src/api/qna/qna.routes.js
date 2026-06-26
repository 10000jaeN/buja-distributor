import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { adminAuthMiddleware } from "../../middleware/admin.middleware.js";
import { optionalAuthMiddleware } from "../../middleware/optionalAuth.middleware.js";
import { getQnaList, createQna, deleteQna, answerQna, getAdminQnaList, getUnansweredCount } from "./qna.controller.js";

const router = express.Router();

/**
 * @route GET /qna?productId=xxx
 * @desc  상품 Q&A 목록 조회 (비밀글은 작성자/어드민만 내용 확인)
 * @access Public (선택적 인증)
 */
router.get("/", optionalAuthMiddleware, asyncHandler(getQnaList));

/**
 * @route POST /qna
 * @desc  Q&A 작성
 * @access Private
 */
router.post("/", authMiddleware, asyncHandler(createQna));

/**
 * @route DELETE /qna/:qnaId
 * @desc  Q&A 삭제 (본인 또는 어드민)
 * @access Private
 */
router.delete("/:qnaId", authMiddleware, asyncHandler(deleteQna));

/**
 * @route GET /qna/admin/all?answered=true|false
 * @desc  어드민: 전체 Q&A 목록 (비밀글 포함)
 * @access Private (Admin Only)
 */
router.get("/admin/all", authMiddleware, adminAuthMiddleware, asyncHandler(getAdminQnaList));

/**
 * @route GET /qna/admin/unanswered-count
 * @desc  어드민: 미답변 Q&A 수 (사이드바 뱃지용)
 * @access Private (Admin Only)
 */
router.get("/admin/unanswered-count", authMiddleware, adminAuthMiddleware, asyncHandler(getUnansweredCount));

/**
 * @route POST /qna/:qnaId/answer
 * @desc  관리자 답변 등록/수정
 * @access Private (Admin Only)
 */
router.post("/:qnaId/answer", authMiddleware, adminAuthMiddleware, asyncHandler(answerQna));

export default router;
