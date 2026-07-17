import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true, min: [0, "할인값은 0 이상이어야 합니다."] },
    maxDiscount: { type: Number, default: null }, // percentage 타입일 때 최대 할인 상한
    minOrderAmount: { type: Number, default: null }, // 최소 주문 소계 (전체 기준)
    // 적용 대상
    target: { type: String, enum: ["all", "product", "category"], default: "all" },
    targetIds: { type: [String], default: [] }, // product ObjectId 문자열 or 카테고리 parent 이름
    maxUses: { type: Number, default: null }, // 전체 발급 수량 (null = 무제한)
    maxUsesPerUser: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", CouponSchema);
export default Coupon;
