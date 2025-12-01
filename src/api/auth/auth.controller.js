import User from "../user/user.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../../utils/jwt.js";

// ** Helper 함수: HttpOnly 쿠키 설정 **
const setRefreshTokenCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true, // JS 접근 금지 (XSS 방어)
    secure: process.env.NODE_ENV === "production", // HTTPS에서만 전송
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7일 만료
    sameSite: "strict", // CSRF 방어
  });
};

// ----------------------------------------------------
// 1. OAuth 로그인/회원가입 처리 및 토큰 발급
// ----------------------------------------------------
export const loginOrCreateUser = async (req, res) => {
  // 💡 테스트를 위해 하드코딩된 사용자 정보
  const { provider, providerId } = req.body; // 'google', 'google-id-123'

  if (!provider || !providerId) {
    return res
      .status(400)
      .json({ message: "Provider and providerId are required." });
  }

  let user = await User.findOne({ provider, providerId });

  if (!user) {
    // 💡 신규 사용자: 회원가입 (테스트를 위해 더미 데이터 사용)
    user = await User.create({
      provider,
      providerId,
      userName: `User_${providerId.slice(-4)}`,
      email: `${providerId}@test.com`,
      address: [{ zipCode: "12345", address1: "Test St" }],
    });
    console.log(`[DB] New user created: ${user.userName}`);
  } else {
    console.log(`[DB] Existing user logged in: ${user.userName}`);
  }

  // 1. 토큰 생성에 필요한 사용자 정보 (payload)
  const payload = { id: user._id, roles: user.roles };

  // 2. 새 Access Token과 Refresh Token 발급
  const accessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  // 3. 💡 토큰 회전 (Token Rotation) - DB에 새 토큰 저장 (Schema Setter가 암호화 처리)
  user.refreshToken = newRefreshToken;
  await user.save();
  console.log(
    `[DB] Saved new refresh token (Encrypted in DB): ${user.refreshToken.slice(
      0,
      10
    )}...`
  );

  // 4. HttpOnly 쿠키 설정
  setRefreshTokenCookie(res, newRefreshToken);

  // 5. Access Token을 JSON 응답으로 전송
  return res.status(200).json({
    message: "로그인 및 토큰 발급 성공",
    accessToken: accessToken,
    userId: user._id,
  });
};

// ----------------------------------------------------
// 2. 토큰 갱신 (Token Rotation & Refresh)
// ----------------------------------------------------
export const refreshTokens = async (req, res) => {
  // 1. HttpOnly 쿠키에서 리프레시 토큰 추출
  const incomingRefreshToken = req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    return res
      .status(401)
      .json({ message: "Refresh token not found in cookies." });
  }

  // 2. JWT 검증
  const decoded = verifyToken(incomingRefreshToken);
  if (!decoded) {
    return res.status(401).json({
      message: "Invalid or expired refresh token (JWT verify failed).",
    });
  }

  // 3. DB에서 사용자 검색 (DB에서 가져올 때 복호화 Getter가 작동)
  const user = await User.findById(decoded.id);

  // 4. 사용자 존재 여부 및 토큰 일치 확인
  if (!user) {
    return res.status(403).json({ message: "User not found." });
  }

  // 💡 4-b. 토큰 일치 확인: user.refreshToken은 복호화된 원본 토큰이므로, 쿠키의 토큰과 비교합니다.
  if (user.refreshToken !== incomingRefreshToken) {
    // 🚨 토큰 재사용 감지 또는 이전 토큰 사용 시도 (보안 위반)
    console.warn(
      `[Security Alert] Token mismatch! Revoking session for user: ${user.userName}`
    );
    user.refreshToken = null; // 모든 토큰 무효화
    await user.save();
    return res.status(403).json({
      message: "Token mismatch or revoked. Please log in again.",
    });
  }

  // 5. 💡 토큰 회전 (Token Rotation) 실행
  const payload = { id: user._id, roles: user.roles };
  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  // 6. DB 업데이트 (기존 토큰 무효화 및 새 토큰 저장)
  user.refreshToken = newRefreshToken; // Schema Setter가 암호화하여 저장
  await user.save();
  console.log(`[DB] Successfully rotated token. New token saved (Encrypted).`);

  // 7. 클라이언트에 새 Refresh Token을 HttpOnly 쿠키로 설정
  setRefreshTokenCookie(res, newRefreshToken);

  // 8. 새 Access Token을 응답
  return res.status(200).json({
    message: "토큰이 성공적으로 갱신되었습니다. (Rotation OK)",
    accessToken: newAccessToken,
  });
};
