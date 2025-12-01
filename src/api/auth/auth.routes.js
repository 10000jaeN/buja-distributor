import express from "express";
import * as authController from "./auth.controller.js";

const router = express.Router();

// 1. 로그인 또는 회원가입 (토큰 발급)
router.post("/login", authController.loginOrCreateUser);

// 2. 토큰 갱신 및 회전
router.post("/token/refresh", authController.refreshTokens);

// 3. 로그아웃
router.post("/logout", authController.logoutUser);

export default router;
