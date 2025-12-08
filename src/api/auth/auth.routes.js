import { Router } from "express";
import passport from "passport";
import {
  loginOrCreateUser,
  refreshTokens,
  logoutUser,
} from "./auth.controller.js";
import asyncHandler from "../../utils/asyncHandler.js";

const router = Router();

// ===============================================
// A. OAuth (Social Login) Routes
// ===============================================

/**
 * @route GET /google
 * @decs 1-1. Google OAuth 인증 시작 및 동의 화면 요청
 * @access Public
 */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * @route GET /google/callback
 * @decs 1-2. Google OAuth 콜백 (인증 성공 시 로그인/회원가입 처리)
 * @access Public (Google Redirect)
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login/fail",
    session: false,
  }),
  asyncHandler(loginOrCreateUser)
);

/**
 * @route GET /naver
 * @decs 2-1. Naver OAuth 인증 시작 및 동의 화면 요청
 * @access Public
 */
router.get("/naver", passport.authenticate("naver", { authType: "reprompt" }));

/**
 * @route GET /naver/callback
 * @decs 2-2. Naver OAuth 콜백 (인증 성공 시 로그인/회원가입 처리)
 * @access Public (Naver Redirect)
 */
router.get(
  "/naver/callback",
  passport.authenticate("naver", {
    failureRedirect: "/login/fail",
    session: false,
  }),
  asyncHandler(loginOrCreateUser)
);

/**
 * @route GET /kakao
 * @decs 3-1. Kakao OAuth 인증 시작 및 동의 화면 요청
 * @access Public
 */
router.get("/kakao", passport.authenticate("kakao"));

/**
 * @route GET /kakao/callback
 * @decs 3-2. Kakao OAuth 콜백 (인증 성공 시 로그인/회원가입 처리)
 * @access Public (Kakao Redirect)
 */
router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    failureRedirect: "/login/fail",
    session: false,
  }),
  asyncHandler(loginOrCreateUser)
);

// ===============================================
// B. Token Management Routes
// ===============================================

/**
 * @route POST /token/refresh
 * @decs 4. Refresh Token을 사용하여 Access Token 재발급 (토큰 로테이션)
 * @access Public (Cookie-based Refresh)
 */
router.post("/token/refresh", asyncHandler(refreshTokens));

/**
 * @route POST /logout
 * @decs 5. 로그아웃 (DB에서 Refresh Token 무효화 및 쿠키 삭제)
 * @access Public (Cookie-based Refresh Token is expected)
 */
router.post("/logout", asyncHandler(logoutUser));

export default router;
