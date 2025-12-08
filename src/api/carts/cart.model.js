import mongoose from "mongoose";

// 장바구니 항목을 위한 서브 스키마
const CartItemSchema = new mongoose.Schema(
  {
    // Product 모델 참조
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    // 상품 수량
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
); // 서브 도큐먼트(항목)에 별도의 _id 생성 방지

// 주요 장바구니 스키마
const CartSchema = new mongoose.Schema(
  {
    // User 모델 참조, 고유 제약 조건으로 사용자당 하나의 장바구니만 허용
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // 장바구니 항목 배열
    items: [CartItemSchema],
  },
  {
    timestamps: true, // createdAt 및 updatedAt 타임스탬프
  }
);

const Cart = mongoose.model("Cart", CartSchema);
export default Cart;
