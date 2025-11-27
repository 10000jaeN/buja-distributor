import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    // stockQuantity: { 재고 - 보류
    //   type: Number,
    //   required: true,
    //   min: 0,
    // },
    category: {
      type: String,
      required: true,
    },
    imageUrls: [
      {
        type: String,
      },
    ],
    isAvailable: {
      // 구매가능 여부?
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
  {
    collection: "products",
  }
);

const Product = mongoose.model("product", ProductSchema);
export default Product;
