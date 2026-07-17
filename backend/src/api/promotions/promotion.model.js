import mongoose from "mongoose";

const PromotionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true, min: [0, "할인값은 0 이상이어야 합니다."] },
    // 적용 대상
    target: {
      type: String,
      enum: ["product", "category", "all"],
      required: true,
      default: "all",
    },
    targetIds: { type: [String], default: [] }, // product ObjectId 문자열 or 카테고리 parent 이름
    // 조건
    minQuantity: { type: Number, default: null }, // 적용 대상 최소 수량
    minOrderAmount: { type: Number, default: null }, // 최소 주문 소계
    // 기간
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Promotion = mongoose.model("Promotion", PromotionSchema);
export default Promotion;
