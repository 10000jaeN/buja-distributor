import mongoose from "mongoose";

/**
 * 특정 상품의 리뷰 통계(개수, 평균 별점)를 업데이트하는 함수
 */
export const updateProductStats = async (productId) => {
  const Product = mongoose.model("Product");
  const Review = mongoose.model("Review");

  const stats = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$productId",
        nReviews: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      "stats.reviewCount": stats[0].nReviews,
      "stats.ratingAverage": Math.round(stats[0].avgRating * 10) / 10,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      "stats.reviewCount": 0,
      "stats.ratingAverage": 0,
    });
  }
};
