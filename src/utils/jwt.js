import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables.");
}

/**
 * Access Token을 생성합니다. (만료 짧음)
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" }); // 1시간
};

/**
 * Refresh Token을 생성합니다. (만료 김)
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" }); // 7일
};

/**
 * 토큰 유효성 검증 및 복호화
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      // 만료된 경우만 따로 표시해주면 프론트엔드가 '재발급' 로직을 돌리기 수월
      return { expired: true };
    }
    return null; // 검증 실패 (만료, 변조 등)
  }
};
