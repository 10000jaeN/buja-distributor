import Promotion from "./promotion.model.js";
import CustomError from "../../utils/customError.js";
import mongoose from "mongoose";

// GET /promotions — 어드민: 전체 목록
export const getAllPromotions = async (req, res) => {
  const promotions = await Promotion.find({}).sort({ createdAt: -1 });
  res.json(promotions);
};

// GET /promotions/active — 현재 활성 프로모션 (결제 페이지용)
// query: productIds (comma-separated), categoryParents (comma-separated)
export const getActivePromotions = async (req, res) => {
  const now = new Date();
  const { productIds, categoryParents } = req.query;

  const pIds = productIds ? productIds.split(",").filter(Boolean) : [];
  const cats = categoryParents ? categoryParents.split(",").filter(Boolean) : [];

  const promotions = await Promotion.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    $or: [
      { target: "all" },
      { target: "product", targetIds: { $in: pIds } },
      { target: "category", targetIds: { $in: cats } },
    ],
  }).sort({ value: -1 });

  res.json(promotions);
};

// POST /promotions — 어드민: 프로모션 생성
export const createPromotion = async (req, res) => {
  const { name, description, type, value, target, targetIds, minQuantity, minOrderAmount, startDate, endDate } = req.body;

  if (!name || !type || value === undefined || !startDate || !endDate) {
    throw new CustomError("name, type, value, startDate, endDate는 필수입니다.", 400);
  }
  if (new Date(startDate) >= new Date(endDate)) {
    throw new CustomError("종료일은 시작일보다 이후여야 합니다.", 400);
  }
  if ((target === "product" || target === "category") && (!targetIds || targetIds.length === 0)) {
    throw new CustomError("target이 product/category일 때 targetIds가 필요합니다.", 400);
  }

  const promotion = await Promotion.create({
    name, description, type, value, target: target ?? "all",
    targetIds: targetIds ?? [],
    minQuantity: minQuantity ?? null,
    minOrderAmount: minOrderAmount ?? null,
    startDate, endDate,
  });

  res.status(201).json(promotion);
};

// PATCH /promotions/:id — 어드민: 프로모션 수정
export const updatePromotion = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new CustomError("유효하지 않은 ID입니다.", 400);

  const { name, description, type, value, target, targetIds, minQuantity, minOrderAmount, startDate, endDate, isActive } = req.body;
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (type !== undefined) updateData.type = type;
  if (value !== undefined) updateData.value = value;
  if (target !== undefined) updateData.target = target;
  if (targetIds !== undefined) updateData.targetIds = targetIds;
  if (minQuantity !== undefined) updateData.minQuantity = minQuantity;
  if (minOrderAmount !== undefined) updateData.minOrderAmount = minOrderAmount;
  if (startDate !== undefined) updateData.startDate = startDate;
  if (endDate !== undefined) updateData.endDate = endDate;
  if (isActive !== undefined) updateData.isActive = isActive;

  const promotion = await Promotion.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  if (!promotion) throw new CustomError("프로모션을 찾을 수 없습니다.", 404);

  res.json(promotion);
};

// DELETE /promotions/:id — 어드민: 프로모션 삭제
export const deletePromotion = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new CustomError("유효하지 않은 ID입니다.", 400);

  const promotion = await Promotion.findByIdAndDelete(id);
  if (!promotion) throw new CustomError("프로모션을 찾을 수 없습니다.", 404);

  res.json({ message: "프로모션이 삭제되었습니다." });
};
