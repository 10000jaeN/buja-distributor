import { Router } from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { adminAuthMiddleware } from "../../middleware/admin.middleware.js";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  addChild,
  updateChild,
  removeChild,
} from "./category.controller.js";

const router = Router();

router.get("/", asyncHandler(getCategories));
router.post("/", authMiddleware, adminAuthMiddleware, asyncHandler(createCategory));
router.patch("/:parent", authMiddleware, adminAuthMiddleware, asyncHandler(updateCategory));
router.delete("/:parent", authMiddleware, adminAuthMiddleware, asyncHandler(deleteCategory));

router.post("/:parent/children", authMiddleware, adminAuthMiddleware, asyncHandler(addChild));
router.patch("/:parent/children/:child", authMiddleware, adminAuthMiddleware, asyncHandler(updateChild));
router.delete("/:parent/children/:child", authMiddleware, adminAuthMiddleware, asyncHandler(removeChild));

export default router;
