import mongoose from "mongoose";
import { updateProductStats } from "./service.js";

// models/Review.js
const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    index: true, // 특정 상품의 리뷰를 빠르게 찾기 위해 인덱스 필수
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // 유저 식별자
  rating: { type: Number, required: true, min: 1, max: 5 }, // 별점
  content: {
    type: String,
    required: true,
    trim: true,
    minLength: [10, "리뷰는 공백을 제외하고 최소 5자 이상 작성해야합니다."],
  },
  images: {
    type: [String],
    validate: [
      (v) => v.length <= 5,
      "이미지는 최대 5장까지만 업로드 가능합니다.",
    ],
  },
  createdAt: { type: Date, default: Date.now },
});

// 저장 후 실행
reviewSchema.post("save", async function () {
  await updateProductStats(this.productId);
});

// 삭제 후 실행 (findOneAndDelete 대응)
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await updateProductStats(doc.productId);
  }
});

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);
export default Review;
