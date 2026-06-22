import { Router } from "express";
import passport from "passport";
import {
  loginOrCreateUser,
  refreshTokens,
  logoutUser,
  exchangeTicket,
  getMe,
  adminLogin,
} from "./auth.controller.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { refreshMiddleware } from "../../middleware/refresh.middleware.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

// ===============================================
// 0. Admin Local Login
// ===============================================

/**
 * @route POST /auth/admin/login
 * @desc 어드민 로컬 로그인 (이메일/비밀번호)
 * @access Public
 */
router.post("/admin/login", asyncHandler(adminLogin));

// ===============================================
// A. OAuth (Social Login) Routes
// ===============================================

/**
 * @route GET /me
 * @decs 현재 로그인 되어있는 유저의 최신 상태 반환
 * @access  Private (인증 필요)
 */
router.get("/me", authMiddleware, asyncHandler(getMe));

// 1. 소셜 로그인 시작 (공통)
router.get("/:provider", (req, res, next) => {
  const { provider } = req.params;

  // 프로바이더별 특수 옵션만 따로 관리
  const options = {
    google: { scope: ["profile", "email"] },
    naver: { authType: "reprompt" },
    kakao: {},
  };

  passport.authenticate(provider, options[provider] || {})(req, res, next);
});

// 2. 소셜 로그인 콜백 (공통)
router.get(
  "/:provider/callback",
  (req, res, next) => {
    const { provider } = req.params;

    // 💡 커스텀 콜백을 사용하여 인증 결과를 가로챕니다.
    passport.authenticate(provider, { session: false }, (err, user, info) => {
      if (err) {
        console.error("Passport Auth Error:", err);
        return res
          .status(500)
          .json({ success: false, message: "인증 중 서버 오류 발생" });
      }

      if (!user) {
        console.error("No User Profile Found:", info);
        return res.status(401).json({
          success: false,
          message: "사용자 정보를 가져오지 못했습니다.",
          detail: info?.message,
        });
      }

      // ⭐ 핵심:Passport가 찾은 userProfile을 req.user에 직접 주입합니다.
      req.user = user;

      // 다음 핸들러인 loginOrCreateUser로 이동합니다.
      next();
    })(req, res, next);
  },
  asyncHandler(loginOrCreateUser)
);

// 3. 티켓 교환 라우트
/**
 * @route POST /auth/exchange
 * @desc 일회용 티켓을 AccessToken(JSON)과 RefreshToken(Cookie)으로 교환
 */
router.post("/exchange", asyncHandler(exchangeTicket));

// ===============================================
// B. Token Management Routes
// ===============================================

/**
 * @route POST /token/refresh
 * @decs Refresh Token을 사용하여 Access Token 재발급 (토큰 로테이션)
 * @access Public (Cookie-based Refresh)
 */
router.post("/token/refresh", refreshMiddleware, asyncHandler(refreshTokens));

/**
 * @route POST /logout
 * @decs 로그아웃 (DB에서 Refresh Token 무효화 및 쿠키 삭제)
 * @access Public (Cookie-based Refresh Token is expected)
 */
router.post("/logout", asyncHandler(logoutUser));

export default router;
