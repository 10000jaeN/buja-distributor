import { verifyToken } from "../utils/jwt.js";
import User from "../api/user/user.model.js";

/**
 * 💡 인증 미들웨어: 보호된 라우트 접근 전 토큰 유효성 검사 및 사용자 정보 추가
 * HttpOnly 쿠키의 Refresh Token을 검증하고 req.user에 사용자 ID를 추가합니다.
 * 🚨 DB 조회 때문에 비동기(async)로 변경되었습니다.
 */
export const authMiddleware = async (req, res, next) => {
  // ⭐️ async로 변경
  const incomingRefreshToken = req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    return res
      .status(401)
      .json({ message: "인증되지 않은 요청입니다. 토큰이 없습니다." });
  }

  // 1. JWT 유효성 검증
  const decoded = verifyToken(incomingRefreshToken);
  if (!decoded) {
    return res.status(401).json({
      message: "유효하지 않거나 만료된 토큰입니다. 다시 로그인해주세요.",
    });
  }

  try {
    // 2. DB에서 사용자 검색
    const user = await User.findById(decoded.id);

    // 3. 🚨 토큰 일치 검증 (가장 중요한 토큰 회전 보안 체크)
    if (!user || user.refreshToken !== incomingRefreshToken) {
      // DB에 저장된 토큰과 현재 토큰이 일치하지 않으면 무효화된 토큰으로 간주
      return res.status(403).json({
        message:
          "토큰이 무효화되었거나 탈취된 토큰입니다. 다시 로그인해주세요.",
      });
    }

    // 4. 요청 객체에 인증된 사용자 정보 추가 (DB 검증까지 완료된 안전한 사용자 ID)
    req.user = {
      id: decoded.id,
      roles: decoded.roles,
    };

    next(); // 통과
  } catch (error) {
    console.error("Auth Middleware DB Error:", error.message);
    // DB 관련 예외 발생 시 서버 오류 처리
    return res
      .status(500)
      .json({ message: "인증 처리 중 서버 오류가 발생했습니다." });
  }
};
