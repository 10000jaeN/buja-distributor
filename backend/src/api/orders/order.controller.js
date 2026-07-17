import Order from "./order.model.js";
import Product from "../products/product.model.js";
import User from "../user/user.model.js";
import Settings from "../settings/settings.model.js";
import Promotion from "../promotions/promotion.model.js";
import Coupon from "../coupons/coupon.model.js";
import UserCoupon from "../coupons/userCoupon.model.js";
import PointTransaction from "../points/pointTransaction.model.js";
import mongoose from "mongoose";
import crypto from "crypto";
import CustomError from "../../utils/customError.js";

// =================================================================
// 도서산간 추가배송비 판별
// =================================================================
const JEJU_KEYWORDS = ["제주"];
const ISLAND_KEYWORDS = ["울릉", "독도", "백령", "연평", "대청", "소청", "덕적", "자월", "영흥"];

function getExtraShippingFee(mainAddress) {
  if (!mainAddress) return 0;
  if (JEJU_KEYWORDS.some((k) => mainAddress.includes(k))) return 3000;
  if (ISLAND_KEYWORDS.some((k) => mainAddress.includes(k))) return 5000;
  return 0;
}

// =================================================================
// 공통 금액 계산 로직 (preview / createOrder 공유)
// - 비묶음: 상품별 freeShippingThreshold 적용
// - 묶음: 합산 금액 기준 bundleFreeThreshold 적용, 최대 배송비
// - 도서산간: mainAddress 키워드 기반 추가배송비
// =================================================================
async function calculateOrderAmounts(items, products, mainAddress) {
  const settings = await Settings.findOne({ key: "global" }).lean();
  const bundleFreeThreshold = settings?.bundleFreeThreshold ?? 50000;

  const bundleMap = new Map();
  const nonBundleMap = new Map();

  for (const item of items) {
    const product = products.find((p) => p._id.toString() === item.productId);
    const map = product.bundleShipping ? bundleMap : nonBundleMap;
    const existing = map.get(item.productId);
    if (existing) {
      existing.totalQuantity += item.quantity;
    } else {
      map.set(item.productId, { product, totalQuantity: item.quantity });
    }
  }

  const itemSubtotal = items.reduce((sum, item) => {
    const product = products.find((p) => p._id.toString() === item.productId);
    return sum + product.price * item.quantity;
  }, 0);

  // 비묶음: 상품별 freeShippingThreshold 적용
  let nonBundleShipping = 0;
  for (const { product, totalQuantity } of nonBundleMap.values()) {
    const threshold = product.freeShippingThreshold ?? 0;
    if (threshold > 0 && product.price * totalQuantity >= threshold) continue;
    nonBundleShipping += product.shippingFee ?? 0;
  }

  // 묶음: 합산 금액 기준 무료 여부, 최대 배송비 적용
  let bundleShipping = 0;
  if (bundleMap.size > 0) {
    const bundleSubtotal = [...bundleMap.values()].reduce(
      (sum, { product, totalQuantity }) => sum + product.price * totalQuantity,
      0
    );
    if (bundleFreeThreshold > 0 && bundleSubtotal >= bundleFreeThreshold) {
      bundleShipping = 0;
    } else {
      bundleShipping = Math.max(...[...bundleMap.values()].map(({ product }) => product.shippingFee ?? 0));
    }
  }

  const baseShippingFee = nonBundleShipping + bundleShipping;
  const extraShippingFee = getExtraShippingFee(mainAddress);
  const shippingFee = baseShippingFee + extraShippingFee;

  return { itemSubtotal, baseShippingFee, extraShippingFee, shippingFee };
}

// =================================================================
// 프로모션 할인 계산
// =================================================================
function calcPromotionDiscount(promotion, items, products) {
  const now = new Date();
  if (!promotion.isActive || now < promotion.startDate || now > promotion.endDate) return 0;

  let applicableSubtotal = 0;
  let applicableQuantity = 0;

  for (const item of items) {
    const product = products.find((p) => p._id.toString() === item.productId);
    if (!product) continue;

    let applicable = false;
    if (promotion.target === "all") {
      applicable = true;
    } else if (promotion.target === "product") {
      applicable = promotion.targetIds.includes(item.productId);
    } else if (promotion.target === "category") {
      applicable = promotion.targetIds.includes(product.category?.parent);
    }

    if (applicable) {
      applicableSubtotal += product.price * item.quantity;
      applicableQuantity += item.quantity;
    }
  }

  if (promotion.minQuantity && applicableQuantity < promotion.minQuantity) return 0;
  if (promotion.minOrderAmount && applicableSubtotal < promotion.minOrderAmount) return 0;
  if (applicableSubtotal === 0) return 0;

  if (promotion.type === "percentage") {
    return Math.floor(applicableSubtotal * (promotion.value / 100));
  }
  return Math.min(promotion.value, applicableSubtotal);
}

// =================================================================
// 쿠폰 할인 계산
// - target: all / product / category 에 따라 적용 대상 소계 계산
// - minOrderAmount는 전체 주문 소계 기준으로 체크
// =================================================================
function calcCouponDiscount(coupon, itemSubtotal, items = [], products = []) {
  if (coupon.minOrderAmount && itemSubtotal < coupon.minOrderAmount) {
    throw new CustomError(
      `쿠폰 최소 주문금액(${coupon.minOrderAmount.toLocaleString()}원)을 충족하지 못합니다.`,
      400
    );
  }

  let applicableSubtotal = itemSubtotal;

  if (coupon.target === "product" && coupon.targetIds?.length > 0) {
    applicableSubtotal = items.reduce((sum, item) => {
      const product = products.find((p) => p._id.toString() === item.productId.toString());
      if (!product) return sum;
      if (coupon.targetIds.includes(item.productId.toString())) {
        return sum + product.price * item.quantity;
      }
      return sum;
    }, 0);
  } else if (coupon.target === "category" && coupon.targetIds?.length > 0) {
    applicableSubtotal = items.reduce((sum, item) => {
      const product = products.find((p) => p._id.toString() === item.productId.toString());
      if (!product) return sum;
      if (coupon.targetIds.includes(product.category?.parent)) {
        return sum + product.price * item.quantity;
      }
      return sum;
    }, 0);
  }

  if (applicableSubtotal === 0) return 0;

  if (coupon.type === "percentage") {
    const discount = Math.floor(applicableSubtotal * (coupon.value / 100));
    return coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount;
  }
  return Math.min(coupon.value, applicableSubtotal);
}

// =================================================================
// 💡 주문번호 생성 함수 (Create unique and readable order number)
// YYMMDD + 6자리 랜덤 숫자/문자 조합 사용
// =================================================================
const generateOrderNumber = () => {
  const now = new Date();
  // YYMMDD 형식
  const datePart =
    now.getFullYear().toString().slice(2) +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    now.getDate().toString().padStart(2, "0");

  // 6자리 랜덤 문자열 (대문자 + 숫자, crypto 기반)
  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase().substring(0, 6);

  return `${datePart}-${randomPart}`;
};

// =================================================================
// 1. 새 주문 생성 (POST /api/orders) - [트랜잭션 필수]
//    상태: pending
// =================================================================
// =================================================================
// 0. 주문 금액 미리보기 (POST /api/orders/preview) — DB 쓰기 없음
// =================================================================
export const previewOrder = async (req, res) => {
  const { items, mainAddress, promotionId, userCouponId, pointsToUse } = req.body;

  if (!items || items.length === 0) {
    throw new CustomError("상품 목록이 비어 있습니다.", 400);
  }

  for (const item of items) {
    if (!item.quantity || item.quantity <= 0) {
      throw new CustomError("상품 수량이 유효하지 않습니다.", 400);
    }
  }

  const productIds = items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds }, isAvailable: true });

  if (products.length !== productIds.length) {
    throw new CustomError("주문 상품 중 품절되거나 존재하지 않는 상품이 있습니다.", 404);
  }

  for (const item of items) {
    const product = products.find((p) => p._id.toString() === item.productId);
    if (product.stock !== null && product.stock < item.quantity) {
      throw new CustomError(`"${product.name}" 재고가 부족합니다. (남은 재고: ${product.stock}개)`, 400);
    }
  }

  const { itemSubtotal, baseShippingFee, extraShippingFee, shippingFee } =
    await calculateOrderAmounts(items, products, mainAddress ?? "");

  // 프로모션 OR 쿠폰 (둘 중 하나)
  let discountAmount = 0;
  let promotionSnapshot = null;
  let couponSnapshot = null;

  if (promotionId && userCouponId) {
    throw new CustomError("프로모션과 쿠폰은 동시에 적용할 수 없습니다.", 400);
  }

  if (promotionId) {
    const promotion = await Promotion.findById(promotionId);
    if (!promotion || !promotion.isActive) throw new CustomError("유효하지 않은 프로모션입니다.", 400);
    discountAmount = calcPromotionDiscount(promotion, items, products);
    promotionSnapshot = { promotionId: promotion._id, name: promotion.name, discountAmount };
  }

  if (userCouponId) {
    const userCoupon = await UserCoupon.findOne({
      _id: userCouponId,
      user: req.user._id,
      status: "available",
    }).populate("coupon");
    if (!userCoupon || !userCoupon.coupon) throw new CustomError("유효하지 않은 쿠폰입니다.", 400);
    const coupon = userCoupon.coupon;
    if (!coupon.isActive) throw new CustomError("비활성화된 쿠폰입니다.", 400);
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new CustomError("만료된 쿠폰입니다.", 400);
    discountAmount = calcCouponDiscount(coupon, itemSubtotal, items, products);
    couponSnapshot = { couponId: coupon._id, code: coupon.code, discountAmount };
  }

  // 포인트 검증
  let validatedPoints = 0;
  if (pointsToUse && pointsToUse > 0) {
    const user = await User.findById(req.user._id).select("points");
    const maxPoints = Math.min(pointsToUse, user?.points ?? 0);
    validatedPoints = Math.max(0, maxPoints);
  }

  const totalAmount = Math.max(0, itemSubtotal - discountAmount - validatedPoints + shippingFee);

  res.status(200).json({
    itemSubtotal,
    discountAmount,
    promotion: promotionSnapshot,
    coupon: couponSnapshot,
    pointsToUse: validatedPoints,
    baseShippingFee,
    extraShippingFee,
    shippingFee,
    totalAmount,
  });
};

// =================================================================
// 1. 새 주문 생성 (POST /api/orders) - [트랜잭션 필수]
//    상태: pending
// =================================================================
export const createOrder = async (req, res) => {
  const { items, shippingAddress, promotionId, userCouponId, pointsToUse } = req.body;
  const userId = req.user._id;

  if (!items || items.length === 0) {
    throw new CustomError("주문할 상품 목록이 비어 있습니다.", 400);
  }
  if (!shippingAddress?.mainAddress || !shippingAddress?.recipientName) {
    throw new CustomError("유효한 배송지 정보가 필요합니다.", 400);
  }
  if (promotionId && userCouponId) {
    throw new CustomError("프로모션과 쿠폰은 동시에 적용할 수 없습니다.", 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const productIds = items.map((item) => item.productId);
    const products = await Product.find({
      _id: { $in: productIds },
      isAvailable: true,
    }).session(session);

    if (products.length !== productIds.length) {
      throw new CustomError("주문 상품 중 품절되거나 존재하지 않는 상품이 있습니다.", 404);
    }

    const orderItems = [];
    for (const item of items) {
      const product = products.find((p) => p._id.toString() === item.productId);
      if (!product || item.quantity <= 0) {
        throw new CustomError(`상품 이름 "${item.name}"의 수량이 유효하지 않습니다.`, 400);
      }
      if (product.stock !== null && product.stock < item.quantity) {
        throw new CustomError(`"${product.name}" 재고가 부족합니다. (남은 재고: ${product.stock}개)`, 400);
      }
      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        categoryParent: product.category?.parent,
      });
    }

    const { itemSubtotal, shippingFee } = await calculateOrderAmounts(
      items,
      products,
      shippingAddress.mainAddress
    );

    // 프로모션 OR 쿠폰 검증 및 할인 계산
    let discountAmount = 0;
    let promotionSnapshot = { promotionId: null, name: null, discountAmount: 0 };
    let couponSnapshot = { couponId: null, code: null, discountAmount: 0 };
    let userCouponDoc = null;

    if (promotionId) {
      const promotion = await Promotion.findById(promotionId).session(session);
      if (!promotion || !promotion.isActive) throw new CustomError("유효하지 않은 프로모션입니다.", 400);
      discountAmount = calcPromotionDiscount(promotion, items, products);
      promotionSnapshot = { promotionId: promotion._id, name: promotion.name, discountAmount };
    }

    if (userCouponId) {
      userCouponDoc = await UserCoupon.findOne({
        _id: userCouponId,
        user: userId,
        status: "available",
      }).session(session).populate("coupon");
      if (!userCouponDoc || !userCouponDoc.coupon) throw new CustomError("유효하지 않은 쿠폰입니다.", 400);
      const coupon = userCouponDoc.coupon;
      if (!coupon.isActive) throw new CustomError("비활성화된 쿠폰입니다.", 400);
      if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new CustomError("만료된 쿠폰입니다.", 400);
      discountAmount = calcCouponDiscount(coupon, itemSubtotal, items, products);
      couponSnapshot = { couponId: coupon._id, code: coupon.code, discountAmount };
    }

    // 포인트 검증
    let validatedPoints = 0;
    if (pointsToUse && pointsToUse > 0) {
      const user = await User.findById(userId).session(session);
      if ((user?.points ?? 0) < pointsToUse) throw new CustomError("보유 포인트가 부족합니다.", 400);
      validatedPoints = pointsToUse;
    }

    const totalAmount = Math.max(0, itemSubtotal - discountAmount - validatedPoints + shippingFee);

    const newOrder = new Order({
      orderNumber: generateOrderNumber(),
      user: userId,
      items: orderItems,
      subtotal: itemSubtotal,
      shippingFee,
      appliedPromotion: promotionSnapshot,
      appliedCoupon: couponSnapshot,
      pointsUsed: validatedPoints,
      pointsEarned: 0, // 구매 확정 시 적립
      totalAmount,
      shippingAddress,
      status: "pending",
    });

    await newOrder.save({ session });

    // 재고 차감
    for (const item of items) {
      const product = products.find((p) => p._id.toString() === item.productId);
      if (product.stock !== null) {
        const newStock = product.stock - item.quantity;
        await Product.findByIdAndUpdate(
          product._id,
          {
            $inc: { stock: -item.quantity },
            ...(newStock <= 0 && { isAvailable: false }),
          },
          { session }
        );
      }
    }

    // 포인트 차감
    if (validatedPoints > 0) {
      const user = await User.findById(userId).session(session);
      const newBalance = user.points - validatedPoints;
      await User.findByIdAndUpdate(userId, { points: newBalance }, { session });
      await PointTransaction.create(
        [{
          user: userId,
          type: "spend",
          amount: validatedPoints,
          balance: newBalance,
          reason: `주문 #${newOrder.orderNumber} 포인트 사용`,
          order: newOrder._id,
        }],
        { session }
      );
    }

    // 쿠폰 사용 처리 — UserCoupon 상태를 'used'로 변경
    if (userCouponDoc) {
      await UserCoupon.findByIdAndUpdate(
        userCouponDoc._id,
        { status: "used", usedAt: new Date(), order: newOrder._id },
        { session }
      );
    }

    await session.commitTransaction();

    res.status(201).json({
      message: "주문이 성공적으로 생성되었습니다. 결제를 진행해주세요.",
      orderId: newOrder._id,
      orderNumber: newOrder.orderNumber,
      totalAmount,
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// =================================================================
// 2. 내 주문 목록 조회 (GET /api/orders)
// =================================================================
export const getMyOrders = async (req, res) => {
  const userId = req.user._id;

  const orders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate("items.productId", "name price thumbnail slug")
    .select("-__v");

  // 주문 내역이 없는 것은 성공적인 응답(200)입니다.
  if (!orders || orders.length === 0) {
    return res
      .status(200)
      .json({ message: "주문 내역이 없습니다.", orders: [] });
  }

  res.status(200).json(orders);
};

// =================================================================
// 3. 특정 주문 상세 조회 (GET /api/orders/:id)
// =================================================================
export const getOrderById = async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user._id;

  // 1. ID 유효성 검사
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new CustomError("유효하지 않은 주문 ID입니다.", 400);
  }

  const order = await Order.findOne({ _id: orderId, user: userId })
    .populate("items.productId", "name price thumbnail slug")
    .select("-__v");

  if (!order) {
    // 2. 주문을 찾지 못했거나 접근 권한이 없는 경우 404
    throw new CustomError(
      "해당 주문을 찾을 수 없거나 접근 권한이 없습니다.",
      404
    );
  }

  res.status(200).json(order);
};

// =================================================================
// 4. 전체 주문 목록 조회 (GET /api/orders/all) - 관리자 전용
// =================================================================
export const getAllOrders = async (req, res) => {
  // 관리자 권한은 adminAuthMiddleware에서 이미 처리됨

  const orders = await Order.find({})
    .sort({ createdAt: -1 })
    .populate("items.productId", "name price")
    .populate("user", "nickName email roles")
    .select("-__v");

  res.status(200).json(orders);
};

// =================================================================
// 5. 주문 결제 완료 처리 (PATCH /api/orders/:id/pay) - [트랜잭션 필수]
//    상태: pending -> paid
// =================================================================
export const completePayment = async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new CustomError("유효하지 않은 주문 ID입니다.", 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).session(session);

    if (!order) {
      throw new CustomError(
        "해당 주문을 찾을 수 없거나 접근 권한이 없습니다.",
        404
      );
    }

    if (order.status !== "pending") {
      // 이미 결제 처리되었거나 다른 상태인 경우 400
      throw new CustomError(
        `이미 처리되었거나 결제 대기 상태가 아닙니다. (현재 상태: ${order.status})`,
        400
      );
    }

    // 💡 핵심 로직: 상태를 'paid'로 업데이트하고 결제 완료 시간 기록
    order.status = "paid";
    order.paidAt = new Date();
    await order.save({ session });

    // 3. 트랜잭션 커밋
    await session.commitTransaction();

    // 4. 응답
    res.status(200).json({
      message:
        "결제가 성공적으로 완료되었으며 주문 상태가 'paid'(결제 완료)로 변경되었습니다.",
      orderId: order._id,
      status: order.status,
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// =================================================================
// 6. 주문 취소 처리 (PATCH /api/orders/:id/cancel) - [트랜잭션 필수]
//    상태: pending, paid, processing -> cancelled
// =================================================================
export const cancelOrder = async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user._id;
  const isAdmin = req.user.roles && req.user.roles.includes("admin");

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new CustomError("유효하지 않은 주문 ID입니다.", 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. 주문 조회 및 권한 확인
    const query = isAdmin ? { _id: orderId } : { _id: orderId, user: userId };
    const order = await Order.findOne(query).session(session);

    if (!order) {
      throw new CustomError(
        "해당 주문을 찾을 수 없거나 취소 권한이 없습니다.",
        404
      );
    }

    // 2. 주문 상태에 따른 취소 가능 여부 확인
    const allowedStatuses = ["pending", "paid", "processing"];
    if (!allowedStatuses.includes(order.status)) {
      throw new CustomError(
        `현재 상태(${order.status})에서는 주문을 취소할 수 없습니다. (취소 가능 상태: pending, paid, processing)`,
        400
      );
    }

    // 3. 결제된 주문은 토스 환불 API 호출
    if (["paid", "processing"].includes(order.status) && order.paymentKey) {
      const secretKey = process.env.TOSS_SECRET_KEY;
      const encoded = Buffer.from(`${secretKey}:`).toString("base64");

      const tossRes = await fetch(
        `https://api.tosspayments.com/v1/payments/${order.paymentKey}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${encoded}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cancelReason: "고객 요청 취소" }),
        }
      );

      if (!tossRes.ok) {
        const tossError = await tossRes.json().catch(() => ({}));
        throw new CustomError(
          tossError.message || "결제 취소에 실패했습니다. 고객센터로 문의해주세요.",
          502
        );
      }
    }

    // 4. 주문 상태를 'cancelled'로 변경하고 취소 시간 기록
    order.status = "cancelled";
    order.cancelledAt = new Date();

    await order.save({ session });

    // 5. 재고 복구 (stock이 있는 상품만)
    for (const item of order.items) {
      const product = await Product.findById(item.productId).session(session);
      if (product && product.stock !== null) {
        await Product.findByIdAndUpdate(
          product._id,
          {
            $inc: { stock: item.quantity },
            isAvailable: true,
          },
          { session }
        );
      }
    }

    // 6. 포인트 환불 (사용한 포인트가 있을 때)
    if (order.pointsUsed > 0) {
      const user = await User.findById(order.user).session(session);
      if (user) {
        const newBalance = user.points + order.pointsUsed;
        await User.findByIdAndUpdate(order.user, { points: newBalance }, { session });
        await PointTransaction.create(
          [{
            user: order.user,
            type: "cancel",
            amount: order.pointsUsed,
            balance: newBalance,
            reason: `주문 #${order.orderNumber} 취소 포인트 환불`,
            order: order._id,
          }],
          { session }
        );
      }
    }

    // 7. 쿠폰 사용 취소 — UserCoupon 상태를 'available'로 복구
    if (order.appliedCoupon?.couponId) {
      await UserCoupon.findOneAndUpdate(
        { order: order._id },
        { status: "available", usedAt: null, order: null },
        { session }
      );
    }

    await session.commitTransaction();

    res.status(200).json({
      message: `주문 ${order.orderNumber}이 성공적으로 취소되었습니다. (상태: cancelled)`,
      orderId: order._id,
      status: order.status,
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// =================================================================
// 7. 상품 준비 시작 처리 (PATCH /api/orders/:id/prepare) - 관리자 전용
//    상태: paid -> processing
// =================================================================
export const startPreparation = async (req, res) => {
  const orderId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new CustomError("유효하지 않은 주문 ID입니다.", 400);
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new CustomError("해당 주문을 찾을 수 없습니다.", 404);
  }

  if (order.status !== "paid") {
    throw new CustomError(
      `상품 준비는 'paid'(결제 완료) 상태에서만 가능합니다. (현재 상태: ${order.status})`,
      400
    );
  }

  // 💡 핵심 로직: 상태를 'processing'(상품 준비 중)으로 변경
  order.status = "processing";
  await order.save();

  res.status(200).json({
    message: `주문 ${order.orderNumber}이 'processing'(상품 준비 중)으로 변경되었습니다.`,
    orderId: order._id,
    status: order.status,
  });
};

// =================================================================
// 8. 배송 시작 처리 (PATCH /api/orders/:id/shipping) - 관리자 전용
//    상태: processing -> shipped
// =================================================================
export const startShipping = async (req, res) => {
  const orderId = req.params.id;
  const { courierName, trackingNumber } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new CustomError("유효하지 않은 주문 ID입니다.", 400);
  }
  if (!courierName || !trackingNumber) {
    throw new CustomError(
      "배송 시작을 위해 택배사 이름과 운송장 번호가 모두 필요합니다.",
      400
    );
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new CustomError("해당 주문을 찾을 수 없습니다.", 404);
  }

  if (order.status !== "processing") {
    throw new CustomError(
      `배송 시작은 'processing'(상품 준비 중) 상태에서만 가능합니다. (현재 상태: ${order.status})`,
      400
    );
  }

  // 💡 핵심 로직: 택배사 정보 입력과 동시에 상태를 'shipped'(배송 중)으로 변경
  order.status = "shipped";
  order.trackingNumber = trackingNumber;
  order.courierName = courierName;
  order.shippedAt = new Date(); // 배송 시작 시점 기록
  await order.save();

  res.status(200).json({
    message: `주문 ${order.orderNumber}의 배송 정보가 등록되고 상태가 'shipped'(배송 중)로 변경되었습니다.`,
    orderId: order._id,
    status: order.status,
    trackingNumber: order.trackingNumber,
    courierName: order.courierName,
  });
};

// =================================================================
// 9. 월별 매출 통계 조회 (GET /api/orders/monthly-stats?year=YYYY&month=MM) - 관리자 전용
// =================================================================
export const getMonthlyStats = async (req, res) => {
  const now = new Date();
  const year = parseInt(req.query.year) || now.getFullYear();
  const month = parseInt(req.query.month) || now.getMonth() + 1;

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  // 전월 범위
  const prevStart = new Date(year, month - 2, 1);
  const prevEnd = new Date(year, month - 1, 1);

  const validStatuses = ["paid", "processing", "shipped", "delivered"];

  // 미처리 기준: paid 상태로 1일 이상 경과
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [salesData, cancelledCount, prevSalesData, unprocessedOrders] = await Promise.all([
    Order.aggregate([
      { $match: { status: { $in: validStatuses }, createdAt: { $gte: startDate, $lt: endDate } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          shippingRevenue: { $sum: "$shippingFee" },
          orderCount: { $sum: 1 },
        },
      },
    ]),
    Order.countDocuments({ status: "cancelled", createdAt: { $gte: startDate, $lt: endDate } }),
    Order.aggregate([
      { $match: { status: { $in: validStatuses }, createdAt: { $gte: prevStart, $lt: prevEnd } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
    ]),
    Order.find({ status: "paid", paidAt: { $lte: oneDayAgo } })
      .select("orderNumber paidAt totalAmount")
      .sort({ paidAt: 1 })
      .lean(),
  ]);

  const data = salesData[0] ?? { totalRevenue: 0, shippingRevenue: 0, orderCount: 0 };
  const prev = prevSalesData[0] ?? { totalRevenue: 0, orderCount: 0 };
  const productRevenue = data.totalRevenue - data.shippingRevenue;

  const revenueGrowthRate = prev.totalRevenue > 0
    ? Math.round(((data.totalRevenue - prev.totalRevenue) / prev.totalRevenue) * 100)
    : null;

  res.status(200).json({
    year,
    month,
    totalRevenue: data.totalRevenue,
    productRevenue,
    shippingRevenue: data.shippingRevenue,
    orderCount: data.orderCount,
    cancelledCount,
    averageOrderValue: data.orderCount > 0 ? Math.round(data.totalRevenue / data.orderCount) : 0,
    prevTotalRevenue: prev.totalRevenue,
    prevOrderCount: prev.orderCount,
    revenueGrowthRate,
    unprocessedOrders: unprocessedOrders.map((o) => ({
      orderNumber: o.orderNumber,
      paidAt: o.paidAt,
      totalAmount: o.totalAmount,
    })),
  });
};

export const getOrderStats = async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year + 1}-01-01`);
  const validStatuses = ["paid", "processing", "shipped", "delivered"];

  const [monthlySales, productRanking, categoryRevenue] = await Promise.all([
    // 1. 월별 매출 (해당 연도)
    Order.aggregate([
      { $match: { status: { $in: validStatuses }, createdAt: { $gte: startDate, $lt: endDate } } },
      { $group: { _id: { $month: "$createdAt" }, revenue: { $sum: "$totalAmount" }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),

    // 2. 상품별 판매 순위 Top 10 (전체 기간)
    Order.aggregate([
      { $match: { status: { $in: validStatuses } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          quantity: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 10 },
    ]),

    // 3. 카테고리별 매출 비율 (해당 연도) — items.categoryParent 스냅샷 사용 (삭제된 상품도 집계)
    Order.aggregate([
      { $match: { status: { $in: validStatuses }, createdAt: { $gte: startDate, $lt: endDate } } },
      { $unwind: "$items" },
      { $match: { "items.categoryParent": { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$items.categoryParent",
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { revenue: -1 } },
    ]),
  ]);

  res.status(200).json({ monthlySales, productRanking, categoryRevenue });
};

// =================================================================
// 10. 배송 완료 처리 (PATCH /api/orders/:id/complete) - 관리자 전용
//    상태: shipped -> delivered
// =================================================================
export const completeDelivery = async (req, res) => {
  const orderId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new CustomError("유효하지 않은 주문 ID입니다.", 400);
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new CustomError("해당 주문을 찾을 수 없습니다.", 404);
  }

  if (order.status !== "shipped") {
    throw new CustomError(
      `배송 완료는 'shipped'(배송 중) 상태에서만 처리할 수 있습니다. (현재 상태: ${order.status})`,
      400
    );
  }

  // 상태를 'delivered'로 변경
  order.status = "delivered";
  order.deliveredAt = new Date();

  // 포인트 적립 (구매 확정 시)
  const settings = await Settings.findOne({ key: "global" }).lean();
  const pointRate = settings?.pointRate ?? 3;
  const earnedPoints = Math.floor(order.totalAmount * (pointRate / 100));

  if (earnedPoints > 0) {
    const user = await User.findById(order.user);
    if (user) {
      const newBalance = user.points + earnedPoints;
      await User.findByIdAndUpdate(order.user, { points: newBalance });
      await PointTransaction.create({
        user: order.user,
        type: "earn",
        amount: earnedPoints,
        balance: newBalance,
        reason: `주문 #${order.orderNumber} 구매 확정 적립`,
        order: order._id,
      });
      order.pointsEarned = earnedPoints;
    }
  }

  await order.save();

  res.status(200).json({
    message: `주문 ${order.orderNumber}이 'delivered'(배송 완료) 처리되었습니다.`,
    orderId: order._id,
    status: order.status,
    pointsEarned: earnedPoints,
  });
};
