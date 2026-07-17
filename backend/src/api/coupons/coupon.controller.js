import Coupon from "./coupon.model.js";
import UserCoupon from "./userCoupon.model.js";
import CustomError from "../../utils/customError.js";
import mongoose from "mongoose";

// ─────────────────────────────────────────
// 어드민 전용
// ─────────────────────────────────────────

// GET /coupons — 전체 쿠폰 목록
export const getAllCoupons = async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.json(coupons);
};

// POST /coupons — 쿠폰 생성
export const createCoupon = async (req, res) => {
  const { code, name, type, value, maxDiscount, minOrderAmount, maxUses, maxUsesPerUser, expiresAt } = req.body;

  if (!code || !name || !type || value === undefined) {
    throw new CustomError("code, name, type, value는 필수입니다.", 400);
  }

  const exists = await Coupon.findOne({ code: code.toUpperCase() });
  if (exists) throw new CustomError("이미 존재하는 쿠폰 코드입니다.", 409);

  const coupon = await Coupon.create({
    code, name, type, value,
    maxDiscount: maxDiscount ?? null,
    minOrderAmount: minOrderAmount ?? null,
    maxUses: maxUses ?? null,
    maxUsesPerUser: maxUsesPerUser ?? 1,
    expiresAt: expiresAt ?? null,
  });

  res.status(201).json(coupon);
};

// PATCH /coupons/:id — 쿠폰 수정
export const updateCoupon = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new CustomError("유효하지 않은 ID입니다.", 400);

  const { name, type, value, maxDiscount, minOrderAmount, maxUses, maxUsesPerUser, expiresAt, isActive } = req.body;
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (type !== undefined) updateData.type = type;
  if (value !== undefined) updateData.value = value;
  if (maxDiscount !== undefined) updateData.maxDiscount = maxDiscount;
  if (minOrderAmount !== undefined) updateData.minOrderAmount = minOrderAmount;
  if (maxUses !== undefined) updateData.maxUses = maxUses;
  if (maxUsesPerUser !== undefined) updateData.maxUsesPerUser = maxUsesPerUser;
  if (expiresAt !== undefined) updateData.expiresAt = expiresAt;
  if (isActive !== undefined) updateData.isActive = isActive;

  const coupon = await Coupon.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  if (!coupon) throw new CustomError("쿠폰을 찾을 수 없습니다.", 404);

  res.json(coupon);
};

// DELETE /coupons/:id — 쿠폰 삭제
export const deleteCoupon = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new CustomError("유효하지 않은 ID입니다.", 400);

  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) throw new CustomError("쿠폰을 찾을 수 없습니다.", 404);

  res.json({ message: "쿠폰이 삭제되었습니다." });
};

// ─────────────────────────────────────────
// 유저 전용
// ─────────────────────────────────────────

// POST /coupons/claim — 쿠폰 코드 입력 → 쿠폰함에 등록
export const claimCoupon = async (req, res) => {
  const { code } = req.body;
  const userId = req.user._id;

  if (!code) throw new CustomError("쿠폰 코드를 입력해주세요.", 400);

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) throw new CustomError("유효하지 않은 쿠폰 코드입니다.", 400);
  if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new CustomError("만료된 쿠폰입니다.", 400);
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    throw new CustomError("쿠폰 발급 한도를 초과했습니다.", 400);
  }

  // 이미 발급받은 쿠폰인지 확인
  const alreadyClaimed = await UserCoupon.findOne({ user: userId, coupon: coupon._id });
  if (alreadyClaimed) throw new CustomError("이미 보유한 쿠폰입니다.", 409);

  await Promise.all([
    UserCoupon.create({ user: userId, coupon: coupon._id }),
    Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } }),
  ]);

  res.status(201).json({
    message: "쿠폰이 쿠폰함에 추가됐습니다.",
    coupon: { code: coupon.code, name: coupon.name, type: coupon.type, value: coupon.value, expiresAt: coupon.expiresAt },
  });
};

// GET /coupons/mine — 내 쿠폰함 조회
export const getMyCoupons = async (req, res) => {
  const userId = req.user._id;
  const { status } = req.query; // 'available' | 'used' | undefined(전체)

  const filter = { user: userId };
  if (status) filter.status = status;

  const userCoupons = await UserCoupon.find(filter)
    .populate("coupon")
    .sort({ issuedAt: -1 })
    .lean();

  res.json(userCoupons);
};
