import express from "express";
import { confirmPayment } from "./payments.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import asyncHandler from "../../utils/asyncHandler.js";

const router = express.Router();

router.post("/confirm", authMiddleware, asyncHandler(confirmPayment));

export default router;
