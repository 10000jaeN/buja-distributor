import { verifyToken } from "../utils/jwt.js";

/**
 * 일반 API용 인증 미들웨어
 * Header의 Authorization: Bearer <AccessToken>을 검증합니다.
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // 1. 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "인증 헤더가 없거나 형식이 틀립니다. (Bearer 토큰 필요)",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2. Access Token 검증
    // (주의: jwt.js에서 JWT_SECRET으로 서명을 확인합니다.)
    const decoded = verifyToken(token);

    if (!decoded || decoded.expired) {
      return res.status(401).json({
        success: false,
        message: "유효하지 않거나 만료된 토큰입니다.",
      });
    }

    // 3. req.user에 유저 정보 저장 (DB 조회 없이 페이로드 데이터 활용)
    // 이제 컨트롤러에서 req.user.id로 접근 가능합니다.
    req.user = {
      _id: decoded.id,
      roles: decoded.roles,
      email: decoded.email || "",
      nickName: decoded.nickName || "",
    };

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "서버 인증 처리 중 오류가 발생했습니다.",
    });
  }
};
