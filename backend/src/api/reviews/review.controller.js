import Review from "./review.model.js";
import CustomError from "../../utils/customError.js";

export const createReview = async (req, res) => {
  const { productId, orderId, rating, content, images } = req.body;
  const userId = req.user._id;

  if (!productId || !rating || !content) {
    throw new CustomError("productId, rating, content는 필수입니다.", 400);
  }

  // 같은 주문+상품 조합 중복 방지
  if (orderId) {
    const existing = await Review.findOne({ orderId, productId, userId });
    if (existing) {
      throw new CustomError("이미 해당 주문 상품에 리뷰를 작성하셨습니다.", 409);
    }
  }

  const newReview = await Review.create({
    productId,
    orderId: orderId || undefined,
    userId,
    rating,
    content,
    images: images || [],
  });

  res.status(201).json({ success: true, data: newReview });
};

export const getProductReviews = async (req, res) => {
  const { productId } = req.params;

  const reviews = await Review.find({ productId })
    .populate("userId", "userName")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: reviews });
};

export const getMyReviews = async (req, res) => {
  const userId = req.user._id;

  const reviews = await Review.find({ userId })
    .populate("productId", "name thumbnail slug")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: reviews });
};

export const updateReview = async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;
  const { rating, content, images } = req.body;

  const update = {};
  if (rating !== undefined) update.rating = rating;
  if (content !== undefined) update.content = content;
  if (images !== undefined) update.images = images;

  const review = await Review.findOneAndUpdate(
    { _id: reviewId, userId },
    update,
    { new: true, runValidators: true }
  ).populate("productId", "name thumbnail");

  if (!review) {
    throw new CustomError("리뷰를 찾을 수 없거나 수정 권한이 없습니다.", 404);
  }

  res.status(200).json({ success: true, data: review });
};

export const deleteReview = async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  const review = await Review.findOneAndDelete({ _id: reviewId, userId });

  if (!review) {
    throw new CustomError("리뷰를 찾을 수 없거나 삭제 권한이 없습니다.", 404);
  }

  res.status(200).json({ success: true, message: "리뷰가 삭제되었습니다." });
};
