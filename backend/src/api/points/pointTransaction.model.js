import mongoose from "mongoose";

const PointTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["earn", "spend", "expire", "cancel"],
      required: true,
    },
    amount: { type: Number, required: true }, // 변동 포인트 (항상 양수)
    balance: { type: Number, required: true }, // 트랜잭션 후 잔액
    reason: { type: String, required: true }, // 예: "주문 #260717-ABC 구매 확정 적립"
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    expiresAt: { type: Date, default: null }, // 현재 null(무제한), 향후 유효기간 도입 가능
  },
  { timestamps: true }
);

PointTransactionSchema.index({ user: 1, createdAt: -1 });

const PointTransaction = mongoose.model("PointTransaction", PointTransactionSchema);
export default PointTransaction;
