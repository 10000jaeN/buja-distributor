import Coupon from "./coupon.model.js";
import CouponUsage from "./couponUsage.model.js";
import CustomError from "../../utils/customError.js";
import mongoose from "mongoose";

// GET /coupons — 어드민: 전체 목록
export const getAllCoupons = async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.json(coupons);
};

// POST /coupons — 어드민: 쿠폰 생성
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

// PATCH /coupons/:id — 어드민: 쿠폰 수정
export const updateCoupon = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new CustomError("유효하지 않은 ID입니다.", 400);

  // code 변경은 불허 (사용 이력과의 정합성)
  delete req.body.code;
  delete req.body.usedCount;

  const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!coupon) throw new CustomError("쿠폰을 찾을 수 없습니다.", 404);

  res.json(coupon);
};

// DELETE /coupons/:id — 어드민: 쿠폰 삭제
export const deleteCoupon = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new CustomError("유효하지 않은 ID입니다.", 400);

  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) throw new CustomError("쿠폰을 찾을 수 없습니다.", 404);

  res.json({ message: "쿠폰이 삭제되었습니다." });
};

// POST /coupons/validate — 유저: 쿠폰 유효성 확인 및 할인 정보 반환
export const validateCoupon = async (req, res) => {
  const { code, subtotal } = req.body;
  const userId = req.user._id;

  if (!code) throw new CustomError("쿠폰 코드를 입력해주세요.", 400);
  if (!subtotal || subtotal <= 0) throw new CustomError("주문 소계 금액이 필요합니다.", 400);

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) throw new CustomError("유효하지 않은 쿠폰 코드입니다.", 400);
  if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new CustomError("만료된 쿠폰입니다.", 400);
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) throw new CustomError("쿠폰 사용 한도를 초과했습니다.", 400);

  const userUsageCount = await CouponUsage.countDocuments({ coupon: coupon._id, user: userId });
  if (userUsageCount >= coupon.maxUsesPerUser) throw new CustomError("이미 사용한 쿠폰입니다.", 400);

  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    throw new CustomError(
      `최소 주문금액 ${coupon.minOrderAmount.toLocaleString()}원 이상 시 사용 가능합니다.`,
      400
    );
  }

  let discountAmount = 0;
  if (coupon.type === "percentage") {
    discountAmount = Math.floor(subtotal * (coupon.value / 100));
    if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
  } else {
    discountAmount = Math.min(coupon.value, subtotal);
  }

  res.json({
    couponId: coupon._id,
    code: coupon.code,
    name: coupon.name,
    discountAmount,
  });
};
