import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    //상품 이름
    name: {
      type: String,
      required: [true, "상품 이름은 필수 항목입니다."],
      trim: true,
    },
    // 상품 설명
    description: {
      type: String,
      required: true,
    },
    // 가격
    price: {
      type: Number,
      required: [true, "상품 가격은 필수 항목입니다."],
      min: [0, "가격은 0보다 크거나 같아야 합니다."],
    },
    // 재고 - 보류
    // stockQuantity: {
    //   type: Number,
    //   required: true,
    //   min: 0,
    // },
    // 분류
    category: {
      type: String,
      required: true,
    },
    // 대표 이미지
    imageUrls: [
      {
        type: String,
      },
    ],
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
