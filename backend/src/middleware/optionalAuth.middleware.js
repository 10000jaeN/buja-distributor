import { verifyToken } from "../utils/jwt.js";

/**
 * 선택적 인증 미들웨어
 * 토큰이 있으면 req.user를 설정하고, 없으면 req.user = null로 계속 진행
 */
export const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = {
        _id: decoded.id,
        roles: decoded.roles,
        email: decoded.email || "",
        nickName: decoded.nickName || "",
      };
    }
  }
  next();
};
