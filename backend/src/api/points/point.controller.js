import PointTransaction from "./pointTransaction.model.js";
import User from "../user/user.model.js";

// GET /points/history — 내 포인트 이력 조회
export const getMyPointHistory = async (req, res) => {
  const userId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [transactions, total, user] = await Promise.all([
    PointTransaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    PointTransaction.countDocuments({ user: userId }),
    User.findById(userId).select("points").lean(),
  ]);

  res.json({
    balance: user?.points ?? 0,
    transactions,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
};
