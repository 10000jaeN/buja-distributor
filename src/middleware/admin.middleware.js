import User from "../api/user/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * 💡 관리자 권한 확인 미들웨어 (adminAuthMiddleware)
 * 모든 요청은 authMiddleware를 통과하여 req.user 객체를 가지고 있어야 합니다.
 */
export const adminAuthMiddleware = asyncHandler(async (req, res, next) => {
  // authMiddleware를 통과한 후 req.user에 사용자 ID만 있는 경우, roles를 다시 DB에서 가져와야 함.
  // authMiddleware에서 roles를 req.user에 추가했다면 바로 사용할 수 있습니다.

  const userId = req.user.id;

  // DB에서 최신 역할 정보를 조회
  const user = await User.findById(userId).select("roles");

  if (!user || !user.roles.includes("admin")) {
    const error = new Error(
      "접근 권한이 없습니다. 관리자만 이용할 수 있는 기능입니다)"
    );
    error.status = 403; // Forbidden
    throw error;
  }

  // 💡 admin 권한이 확인되면 다음으로 진행
  next();
});
