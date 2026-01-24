import User from "../user/user.model.js";
import asyncHandler from "../../utils/asyncHandler.js"; // 에러 처리를 위한 asyncHandler 추가
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import setRefreshTokenCookie from "../../utils/auth.utils.js";

// 1. 티켓 저장소 (서버 메모리 상에 위치)
// 서버가 여러 대라면 Redis를 사용해야 합니다.
const ticketStore = new Map();

/**
 * @desc 1 & 2. OAuth 인증 후 로그인 또는 회원가입 처리
 * 최종적으로 토큰을 바로 주지 않고 '티켓'을 발급하여 리다이렉트함
 */

export const loginOrCreateUser = asyncHandler(async (req, res) => {
  const authInfo = req.user || req.authInfo;
  const { provider, providerId, email, nickName } = authInfo;

  if (!provider || !providerId) {
    return res.status(401).json({ message: "인증 정보를 가져올 수 없습니다." });
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
      address: [],
    });
  }

  // JWT 토큰 생성
  const payload = { id: user._id, roles: user.roles };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // DB에 Refresh Token 업데이트 (토큰 로테이션 준비)
  user.refreshToken = refreshToken;
  await user.save();

  // 티켓 발권 로직
  const ticketId = Math.random().toString(36).substring(2, 15);

  // 티켓에 토큰 정보를 매핑하여 저장 (유효시간 1분)
  ticketStore.set(ticketId, {
    accessToken,
    refreshToken,
    userId: user._id,
    nickName: nickName,
  });
  setTimeout(() => ticketStore.delete(ticketId), 60000);

  //프론트엔드 리다이렉트 (토큰 대신 티켓만 노출)
  const FRONTEND_URL = process.env.FRONTEND_URL;

  return res.redirect(`${FRONTEND_URL}/login/success?ticket=${ticketId}`);
});

/**
 * @desc 3. 티켓을 토큰으로 교환 (프론트엔드 최초 진입 시 호출)
 */
export const exchangeTicket = asyncHandler(async (req, res) => {
  const { ticket } = req.body;

  if (!ticket || !ticketStore.has(ticket)) {
    return res
      .status(400)
      .json({ message: "유효하지 않거나 만료된 티켓입니다." });
  }

  const tokenData = ticketStore.get(ticket);

  // 사용 즉시 티켓 폐기 (일회용 보안)
  ticketStore.delete(ticket);

  // 보안 응답: Refresh Token은 쿠키에 굽기
  setRefreshTokenCookie(res, tokenData.refreshToken);

  // 일반 응답: Access Token은 JSON으로 전달
  return res.status(200).json({
    message: "인증 성공",
    accessToken: tokenData.accessToken,
    userId: tokenData.userId,
    nickName: tokenData.nickName,
  });
});

/**
 * @desc 4. 토큰 재발급 (Access Token 만료 시 로테이션)
 */
export const refreshTokens = asyncHandler(async (req, res) => {
  // refreshMiddleware를 거쳐온 user 정보 사용
  const user = req.user;

  const payload = { id: user._id, roles: user.roles };
  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  // DB 토큰 갱신 (로테이션)
  user.refreshToken = newRefreshToken;
  await user.save();

  // 새 쿠키 설정
  setRefreshTokenCookie(res, newRefreshToken);

  return res.status(200).json({
    accessToken: newAccessToken,
  });
});

/**
 * @desc 5. 로그아웃
 */
export const logoutUser = asyncHandler(async (req, res) => {
  const user = req.user;

  // DB에서 리프레시 토큰 제거
  user.refreshToken = null;
  await user.save();

  // 브라우저 쿠키 삭제
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });

  return res.status(200).json({ message: "로그아웃 성공" });
});

/**
 * @desc 현재 로그인된 유저 최신정보 반환
 */
export const getMe = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "인증되지 않은 사용자입니다." });
  }

  res.status(200).json({
    user: {
      userId: req.user._id,
      nickName: req.user.nickName,
      roles: req.user.roles,
      email: req.user.email || "",
    },
  });
});
