import mongoose from "mongoose";
import { updateProductStats } from "./service.js";

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    index: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  content: {
    type: String,
    required: true,
    trim: true,
    minLength: [10, "리뷰는 최소 10자 이상 작성해야합니다."],
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

reviewSchema.post("save", async function () {
  await updateProductStats(this.productId);
});

reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await updateProductStats(doc.productId);
  }
});

reviewSchema.post("findOneAndUpdate", async function (doc) {
  if (doc) {
    await updateProductStats(doc.productId);
  }
});

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);
export default Review;
