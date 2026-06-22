import User from "../api/user/user.model.js";
import { verifyRefreshToken } from "../utils/jwt.js";

export const refreshMiddleware = async (req, res, next) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    return res.status(401).json({ message: "리프레시 토큰이 없습니다." });
  }

  const decoded = verifyRefreshToken(incomingRefreshToken);
  if (!decoded)
    return res.status(401).json({ message: "로그인이 필요합니다." });

  try {
    const user = await User.findById(decoded.id);

    // 여기서만 DB의 refreshToken과 대조합니다 (보안의 핵심)
    if (!user || user.refreshToken !== incomingRefreshToken) {
      if (user) {
        user.refreshToken = null; // 탈취 의심 시 무효화
        await user.save();
      }
      return res.status(403).json({ message: "유효하지 않은 접근입니다." });
    }

    req.user = user; // 전체 유저 객체를 넘겨줌
    next();
  } catch (error) {
    return res.status(500).json({ message: "서버 오류" });
  }
};
