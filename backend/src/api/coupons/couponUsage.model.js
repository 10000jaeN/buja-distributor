import mongoose from "mongoose";

const CouponUsageSchema = new mongoose.Schema(
  {
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  },
  { timestamps: true }
);

// 사용자당 쿠폰 중복 사용 방지 인덱스 (maxUsesPerUser 기준으로 애플리케이션 레벨에서 체크)
CouponUsageSchema.index({ coupon: 1, user: 1 });

const CouponUsage = mongoose.model("CouponUsage", CouponUsageSchema);
export default CouponUsage;
