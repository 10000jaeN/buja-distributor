import mongoose from "mongoose";

// 유저에게 발급된 쿠폰 (쿠폰함)
const UserCouponSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", required: true },
    status: { type: String, enum: ["available", "used"], default: "available" },
    issuedAt: { type: Date, default: Date.now },
    usedAt: { type: Date, default: null },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  },
  { timestamps: true }
);

// 유저당 쿠폰 중복 발급 방지
UserCouponSchema.index({ user: 1, coupon: 1 }, { unique: true });

const UserCoupon = mongoose.model("UserCoupon", UserCouponSchema);
export default UserCoupon;
