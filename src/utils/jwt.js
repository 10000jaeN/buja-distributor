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
    return null; // 검증 실패 (만료, 변조 등)
  }
};
