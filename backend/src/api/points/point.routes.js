import express from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { getMyPointHistory } from "./point.controller.js";

const router = express.Router();

router.get("/history", authMiddleware, asyncHandler(getMyPointHistory));

export default router;
