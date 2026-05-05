import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    //상품 이름
    name: {
      type: String,
      required: [true, "상품 이름은 필수 항목입니다."],
      trim: true,
    },
    // URL용 고유 슬러그
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    // 상품 상세
    contentBlock: [
      {
        type: { type: String, enum: ["text", "image"], required: true },
        value: { type: String, required: true },
      },
    ],
    // 가격
    price: {
      type: Number,
      required: [true, "상품 가격은 필수 항목입니다."],
      min: [0, "가격은 0보다 크거나 같아야 합니다."],
    },
    // 배송비
    shippingFee: {
      type: Number,
      default: 3000,
      min: [0, "배송비는 0보다 크거나 같아야 합니다."],
    },
    // 무료배송 기준금액 (0이면 조건 없음)
    freeShippingThreshold: {
      type: Number,
      default: 0,
      min: [0, "무료배송 기준금액은 0보다 크거나 같아야 합니다."],
    },
    // 묶음배송 가능 여부
    bundleShipping: {
      type: Boolean,
      default: false,
    },
    // 분류
    category: {
      parent: { type: String, required: true },
      child: { type: String, required: true },
      path: [{ type: String }],
    },
    // 대표 이미지
    thumbnail: [
      {
        type: String,
        required: true,
      },
    ],
    // 정렬 및 수요관리를 위한 카운팅
    stats: {
      orderCount: { type: Number, default: 0 },
      reviewCount: { type: Number, default: 0 },
      ratingAverage: { type: Number, default: 0 },
    },
    // 판매가능 여부
    isAvailable: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
  },
  {
    collection: "products",
  }
);

const Product = mongoose.model("Product", ProductSchema);
export default Product;
