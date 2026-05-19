import Review from "./review.model.js";

export const createReview = async (req, res) => {
  const { productId, rating, content, images } = req.body;
  // userId는 보통 인증 미들웨어에서 넘겨받은 값을 사용합니다.
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "인증 정보가 없습니다. 다시 로그인해주세요.",
    });
  }

  const newReview = new Review({
    productId,
    userId,
    rating,
    content,
    images: images || [],
  });

  await newReview.save();

  res.status(201).json({
    success: true,
    data: newReview,
  });
};

export const getProductReviews = async (req, res) => {
  try {
    const { slug } = req.params;
    const reviews = await Review.find({ slug }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: "리뷰 조회 실패" });
  }
};

export const deleteReview = async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id; // 인증 미들웨어에서 넘어온 유저 정보

  // 본인의 리뷰인지 확인하며 삭제
  const review = await Review.findOneAndDelete({ _id: reviewId, userId });

  if (!review) {
    return res.status(404).json({
      success: false,
      message: "리뷰를 찾을 수 없거나 삭제 권한이 없습니다.",
    });
  }

  res.status(200).json({ success: true, message: "리뷰가 삭제되었습니다." });
};
