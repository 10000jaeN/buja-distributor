import User from "../user/user.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../../utils/jwt.js";
import setRefreshTokenCookie from "../../utils/auth.utils.js";
import asyncHandler from "../../utils/asyncHandler.js"; // 에러 처리를 위한 asyncHandler 추가

// ----------------------------------------------------
// 1. OAuth 로그인/회원가입 처리 및 토큰 발급 (Passport 콜백용)
// ----------------------------------------------------
export const loginOrCreateUser = asyncHandler(async (req, res, next) => {
  // Passport가 인증 후 전달한 통일된 사용자 정보 객체 사용
  const authInfo = req.user || req.authInfo;

  // Passport Strategy의 mapProfileToUser 헬퍼 함수를 통해 통일된 데이터 구조를 받음
  const { provider, providerId, email, nickName } = authInfo;

  if (!provider || !providerId) {
    return res.status(401).json({
      message: "OAuth 인증 정보를 가져올 수 없습니다. 다시 시도해 주세요.",
    });
  }

  // 1. DB에서 사용자 검색 (provider와 providerId 쌍으로)
  let user = await User.findOne({ provider, providerId });

  if (!user) {
    // 신규 사용자: 회원가입 (실제 OAuth 데이터 사용)
    user = await User.create({
      provider,
      providerId,
      email: email || null,
      nickName: nickName,
      address: [], // 초기 주소는 비워 둡니다.
    });
    console.log(`[DB] New user created: ${user.nickName} (${user.provider})`);
  } else {
    console.log(
      `[DB] Existing user logged in: ${user.nickName} (${user.provider})`
    );
  }

  // 2. 토큰 생성 및 회전
  const payload = { id: user._id, roles: user.roles };
  const accessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  // DB에 새 토큰 저장 (Schema Setter가 암호화 처리)
  user.refreshToken = newRefreshToken;
  await user.save();

  // HttpOnly 쿠키 설정
  setRefreshTokenCookie(res, newRefreshToken);

  return res.status(200).json({
    message: "로그인 및 토큰 발급 성공",
    accessToken: accessToken,
    userId: user._id,
    nickName: user.nickName,
  });
});

// ----------------------------------------------------
// 2. 토큰 갱신 (Token Rotation & Refresh)
// ----------------------------------------------------
export const refreshTokens = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    return res
      .status(401)
      .json({ message: "Refresh token not found in cookies." });
  }

  // 1. JWT 검증
  const decoded = verifyToken(incomingRefreshToken);
  if (!decoded) {
    return res.status(401).json({
      message: "Invalid or expired refresh token (JWT verify failed).",
    });
  }

  // 2. DB에서 사용자 검색 (DB에서 가져올 때 복호화 Getter가 작동)
  const user = await User.findById(decoded.id);

  if (!user) {
    return res.status(403).json({ message: "User not found." });
  }

  // 3. 토큰 일치 확인 (🚨 토큰 재사용 공격 방어)
  if (user.refreshToken !== incomingRefreshToken) {
    console.warn(
      `[Security Alert] Token mismatch! Revoking session for user ID: ${user._id}`
    );
    user.refreshToken = null; // 모든 토큰 무효화
    await user.save();
    return res.status(403).json({
      message: "Token mismatch or revoked. Please log in again.",
    });
  }

  // 4. 토큰 회전 (Token Rotation) 실행 및 저장
  const payload = { id: user._id, roles: user.roles };
  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  user.refreshToken = newRefreshToken; // Schema Setter가 암호화하여 저장
  await user.save();

  // 5. 클라이언트에 새 Refresh Token을 HttpOnly 쿠키로 설정
  setRefreshTokenCookie(res, newRefreshToken);

  return res.status(200).json({
    message: "토큰이 성공적으로 갱신되었습니다. (Rotation OK)",
    accessToken: newAccessToken,
  });
});

// ----------------------------------------------------
// 3. 로그아웃 함수
// ----------------------------------------------------
export const logoutUser = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  };

  // 클라이언트 쿠키 삭제 (무조건 실행)
  res.clearCookie("refreshToken", cookieOptions);

  if (!incomingRefreshToken) {
    return res.status(204).send();
  }

  // DB에서 토큰 무효화
  const decoded = verifyToken(incomingRefreshToken);
  if (decoded?.id) {
    // 토큰이 복호화될 때 getter가 작동하므로 select() 사용 불필요
    const user = await User.findById(decoded.id);
    if (user) {
      user.refreshToken = null;
      await user.save(); // DB의 토큰 무효화
    }
  }
  return res.status(204).send();
});
