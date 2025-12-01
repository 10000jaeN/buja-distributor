import { verifyToken } from "../utils/jwt.js";

// 💡 인증 미들웨어: 보호된 라우트 접근 전 토큰 유효성 검사 및 사용자 정보 추가
const authMiddleware = (req, res, next) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    return res
      .status(401)
      .json({ message: "인증되지 않은 요청입니다. 토큰이 없습니다." });
  }

  const decoded = verifyToken(incomingRefreshToken);
  if (!decoded) {
    return res.status(401).json({
      message: "유효하지 않거나 만료된 토큰입니다. 다시 로그인해주세요.",
    });
  }

  // 요청 객체에 인증된 사용자 정보 추가
  req.user = {
    id: decoded.id,
    roles: decoded.roles,
  };

  next();
};

export default authMiddleware;
