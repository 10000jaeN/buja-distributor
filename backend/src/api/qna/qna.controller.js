import Qna from "./qna.model.js";
import CustomError from "../../utils/customError.js";

/**
 * GET /qna?productId=xxx
 * 특정 상품의 Q&A 목록 조회
 * 비밀글은 작성자 본인 또는 어드민만 내용 확인 가능 (나머지는 content null 반환)
 * @access Public (선택적 인증)
 */
export const getQnaList = async (req, res) => {
  const { productId } = req.query;
  if (!productId) throw new CustomError("productId가 필요합니다.", 400);

  const qnaList = await Qna.find({ productId })
    .populate("userId", "_id nickName")
    .sort({ createdAt: -1 });

  const requesterId = req.user?._id?.toString();
  const isAdmin = req.user?.roles?.includes("admin");

  const result = qnaList.map((qna) => {
    const isAuthor = requesterId && qna.userId._id.toString() === requesterId;
    const canView = !qna.isSecret || isAdmin || isAuthor;

    return {
      _id: qna._id,
      productId: qna.productId,
      userId: qna.userId,
      isSecret: qna.isSecret,
      content: canView ? qna.content : null,
      answer: canView ? qna.answer : null,
      answeredAt: canView ? qna.answeredAt : null,
      createdAt: qna.createdAt,
    };
  });

  res.status(200).json({ data: result });
};

/**
 * POST /qna
 * Q&A 작성
 * @access Private
 */
export const createQna = async (req, res) => {
  const { productId, content, isSecret } = req.body;
  const userId = req.user._id;

  if (!productId || !content) {
    throw new CustomError("productId와 content는 필수입니다.", 400);
  }

  const newQna = await Qna.create({
    productId,
    userId,
    content,
    isSecret: isSecret ?? false,
  });

  const populated = await newQna.populate("userId", "_id nickName");

  res.status(201).json({ data: populated });
};

/**
 * DELETE /qna/:qnaId
 * Q&A 삭제 (본인 또는 어드민)
 * @access Private
 */
export const deleteQna = async (req, res) => {
  const { qnaId } = req.params;
  const requesterId = req.user._id.toString();
  const isAdmin = req.user.roles?.includes("admin");

  const qna = await Qna.findById(qnaId);
  if (!qna) throw new CustomError("문의를 찾을 수 없습니다.", 404);

  const isAuthor = qna.userId.toString() === requesterId;
  if (!isAuthor && !isAdmin) {
    throw new CustomError("삭제 권한이 없습니다.", 403);
  }

  await Qna.findByIdAndDelete(qnaId);
  res.status(200).json({ message: "문의가 삭제되었습니다." });
};

/**
 * GET /qna/my
 * 내 문의 목록 조회
 * @access Private
 */
export const getMyQnaList = async (req, res) => {
  const userId = req.user._id;

  const qnaList = await Qna.find({ userId })
    .populate("productId", "name slug")
    .sort({ createdAt: -1 });

  res.status(200).json({ data: qnaList });
};

/**
 * GET /qna/my/unread-count?since=ISO_DATE
 * 마지막 확인 이후 새 답변 수 (마이페이지 뱃지용)
 * @access Private
 */
export const getMyUnreadAnswerCount = async (req, res) => {
  const userId = req.user._id;
  const { since } = req.query;

  const filter = { userId, answer: { $ne: null } };
  if (since) filter.answeredAt = { $gt: new Date(since) };

  const count = await Qna.countDocuments(filter);
  res.status(200).json({ count });
};

/**
 * GET /qna/admin/all?answered=true|false
 * 어드민: 전체 Q&A 목록 조회 (비밀글 내용 포함)
 * @access Private (Admin Only)
 */
export const getAdminQnaList = async (req, res) => {
  const { answered } = req.query;

  const filter = {};
  if (answered === "true") filter.answer = { $ne: null };
  if (answered === "false") filter.answer = null;

  const qnaList = await Qna.find(filter)
    .populate("userId", "_id nickName")
    .populate("productId", "name slug")
    .sort({ createdAt: -1 });

  res.status(200).json({ data: qnaList });
};

/**
 * GET /qna/admin/unanswered-count
 * 어드민: 미답변 Q&A 수 조회 (사이드바 뱃지용)
 * @access Private (Admin Only)
 */
export const getUnansweredCount = async (req, res) => {
  const count = await Qna.countDocuments({ answer: null });
  res.status(200).json({ count });
};

/**
 * POST /qna/:qnaId/answer
 * 관리자 답변 등록/수정
 * @access Private (Admin Only)
 */
export const answerQna = async (req, res) => {
  const { qnaId } = req.params;
  const { answer } = req.body;

  if (!answer?.trim()) throw new CustomError("답변 내용을 입력해주세요.", 400);

  const qna = await Qna.findByIdAndUpdate(
    qnaId,
    { answer: answer.trim(), answeredAt: new Date() },
    { new: true }
  ).populate("userId", "_id nickName");

  if (!qna) throw new CustomError("문의를 찾을 수 없습니다.", 404);

  res.status(200).json({ data: qna });
};
