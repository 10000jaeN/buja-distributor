import mongoose from "mongoose";
import AddressSchema from "../../models/schemas/AddressSchema";

const OrderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    name: {
      // 주문 시점의 상품 이름 스냅샷
      type: String,
      required: true,
    },
    price: {
      // 주문 시점의 상품 가격 스냅샷
      type: Number,
      required: true,
    },
    quantity: {
      // 재고
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    _id: false,
  }
);

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    orderItems: [OrderItemSchema], // 주문 상품 목록
    totalAmount: {
      // 총 결제 금액
      type: Number,
      required: true,
      min: 0,
    },
    shippingAddress: {
      type: AddressSchema,
      required: true,
    },
    status: {
      // 주문 처리 상태
      type: String,
      default: "Pending",
      enum: ["Pending", "Processing", "Delivered", "Cancelled"],
    },
    paymentMethod: {
      //결제 수단
      type: String,
      required: true,
    },
    paidAt: Date, //실제 결제가 이루어진 시점.
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);
export default Order;
