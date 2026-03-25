import mongoose from "mongoose";
import AddressSchema from "../../models/schemas/AddressSchema.js";

// 주문된 개별 상품의 정보를 담는 하위 스키마
const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // 'Product' 모델 참조
    required: true,
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 }, // 주문 당시의 가격
});

// 주문 전체 스키마
const OrderSchema = new mongoose.Schema(
  {
    // 주문번호
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    // 주문한 사용자 ID (authMiddleware를 통해 알 수 있음)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // 'User' 모델 참조
      required: true,
    },
    // 주문 상품 목록
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [
        (items) => items.length > 0,
        "주문 상품은 최소 하나 이상이어야 합니다.",
      ],
    },
    // 총 결제 금액
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    // 주문 상태
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    // 배송지 정보 (간단하게 포함, 실제로는 별도 스키마 참조)
    shippingAddress: {
      type: AddressSchema,
      required: true,
    },
    // 타임스탬프
    paidAt: { type: Date },
    cancelledAt: { type: Date },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    // 배송 정보
    trackingNumber: { type: String },
    courierName: { type: String },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", OrderSchema);
export default Order;
