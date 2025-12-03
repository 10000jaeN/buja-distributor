import Order from "./order.model.js";
import Product from "../products/product.model.js";
import mongoose from "mongoose";

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

  // 6자리 랜덤 문자열 (대소문자 + 숫자)
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();

  return `${datePart}-${randomPart}`;
};

// =================================================================
// 1. 새 주문 생성 (POST /api/orders) - [트랜잭션 필수]
//    상태: pending
// =================================================================
export const createOrder = async (req, res) => {
  // 1. 유효성 검사 및 데이터 추출
  const { items, shippingAddress } = req.body;
  // req.user는 인증 미들웨어를 통해 주입된 사용자 정보 (ID 포함)
  const userId = req.user.id;

  if (!items || items.length === 0) {
    return res
      .status(400)
      .json({ message: "주문할 상품 목록이 비어 있습니다." });
  }
  if (
    !shippingAddress ||
    !shippingAddress.address1 ||
    !shippingAddress.recipientName
  ) {
    return res
      .status(400)
      .json({ message: "유효한 배송지 정보가 필요합니다." });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 2. 주문 상품 정보 및 가격 검증 (원자성 보장)
    const productIds = items.map((item) => item.productId);
    // Product 모델에는 isAvailable 필드가 있다고 가정
    const products = await Product.find({
      _id: { $in: productIds },
      isAvailable: true,
    }).session(session);

    if (products.length !== productIds.length) {
      await session.abortTransaction();
      return res.status(404).json({
        message: "주문 상품 중 품절되거나 존재하지 않는 상품이 있습니다.",
      });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = products.find((p) => p._id.toString() === item.productId);
      if (!product || item.quantity <= 0) {
        await session.abortTransaction();
        return res.status(400).json({
          message: `상품 이름 "${item.name}"의 수량이 유효하지 않습니다.`,
        });
      }

      // 3. 주문 당시 스냅샷 데이터 생성
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product._id,
        name: product.name, // 스냅샷: 주문 당시 상품 이름
        price: product.price, // 스냅샷: 주문 당시 상품 가격
        quantity: item.quantity,
      });
    }

    // 4. 주문번호 생성
    const orderNumber = generateOrderNumber();

    // 5. 주문 문서 생성 (pending 상태로 DB에 저장)
    const newOrder = new Order({
      orderNumber,
      user: userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      status: "pending", // 초기 상태는 결제 대기
    });

    await newOrder.save({ session });

    // 6. 트랜잭션 커밋 및 응답
    await session.commitTransaction();
    res.status(201).json({
      message: "주문이 성공적으로 생성되었습니다. 결제를 진행해주세요.",
      orderId: newOrder._id,
      orderNumber: newOrder.orderNumber, // 💡 응답에 주문번호 포함
    });
  } catch (error) {
    await session.abortTransaction();
    // 7. 에러 처리
    console.error("Error creating order:", error);
    res.status(500).json({ message: "주문 생성 중 서버 오류가 발생했습니다." });
  } finally {
    session.endSession();
  }
};

// =================================================================
// 2. 내 주문 목록 조회 (GET /api/orders)
// =================================================================
export const getMyOrders = async (req, res) => {
  const userId = req.user.id;
  try {
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("items.productId", "name price")
      .select("-__v"); // 불필요한 필드 제거

    if (!orders || orders.length === 0) {
      return res
        .status(200)
        .json({ message: "주문 내역이 없습니다.", orders: [] });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching my orders:", error);
    res
      .status(500)
      .json({ message: "주문 목록 조회 중 서버 오류가 발생했습니다." });
  }
};

// =================================================================
// 3. 특정 주문 상세 조회 (GET /api/orders/:id)
// =================================================================
export const getOrderById = async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ message: "유효하지 않은 주문 ID입니다." });
  }

  try {
    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate("items.productId", "name price")
      .select("-__v");

    if (!order) {
      return res
        .status(404)
        .json({ message: "해당 주문을 찾을 수 없거나 접근 권한이 없습니다." });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    // CastError가 여기서 발생했다면 이미 라우트에서 처리되었어야 함.
    res
      .status(500)
      .json({ message: "주문 상세 조회 중 서버 오류가 발생했습니다." });
  }
};

// =================================================================
// 4. 전체 주문 목록 조회 (GET /api/orders/all) - 관리자 전용
// =================================================================
export const getAllOrders = async (req, res) => {
  try {
    // 모든 주문을 조회하되, 주문자를 populate하여 관리자가 쉽게 볼 수 있도록 함
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate("items.productId", "name price")
      .populate("user", "userName email roles") // 주문자 정보도 함께 조회
      .select("-__v");

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res
      .status(500)
      .json({ message: "전체 주문 목록 조회 중 서버 오류가 발생했습니다." });
  }
};

// =================================================================
// 5. 주문 결제 완료 처리 (PATCH /api/orders/:id/pay)
// 💡 결제 대기(pending) -> 결제 완료(paid) 상태로 변경합니다.
// =================================================================
export const completePayment = async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ message: "유효하지 않은 주문 ID입니다." });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. 주문 조회 및 상태 확인 (user와 orderId, 그리고 상태가 'pending'인지 확인)
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).session(session);

    if (!order) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ message: "해당 주문을 찾을 수 없거나 접근 권한이 없습니다." });
    }

    if (order.status !== "pending") {
      await session.abortTransaction();
      return res.status(400).json({
        message: `이미 처리되었거나 결제 대기 상태가 아닙니다. (현재 상태: ${order.status})`,
      });
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
    console.error("Error completing payment:", error);
    res.status(500).json({ message: "결제 처리 중 서버 오류가 발생했습니다." });
  } finally {
    session.endSession();
  }
};

// =================================================================
// 6. 주문 취소 처리 (DELETE /api/orders/:id/cancel)
//    상태: pending, paid, processing -> cancelled
// =================================================================
export const cancelOrder = async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.id;
  // 관리자는 모든 주문 취소 가능하도록, 일반 사용자는 자신의 주문만 취소 가능하도록 구현
  const isAdmin = req.user.roles && req.user.roles.includes("admin");

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ message: "유효하지 않은 주문 ID입니다." });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. 주문 조회 및 권한 확인
    const query = isAdmin ? { _id: orderId } : { _id: orderId, user: userId };
    const order = await Order.findOne(query).session(session);

    if (!order) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ message: "해당 주문을 찾을 수 없거나 취소 권한이 없습니다." });
    }

    // 2. 주문 상태에 따른 취소 가능 여부 확인
    const allowedStatuses = ["pending", "paid", "processing"];
    if (!allowedStatuses.includes(order.status)) {
      await session.abortTransaction();
      return res.status(400).json({
        message: `현재 상태(${order.status})에서는 주문을 취소할 수 없습니다. 고객센터에 문의해주세요. (취소 가능 상태: pending, paid, processing)`,
      });
    }

    // 3. 핵심 로직: 상태를 'cancelled'로 변경하고 취소 시간 기록
    order.status = "cancelled";
    order.cancelledAt = new Date();

    // 4. 재고 복구 로직 (여기에서 구현)
    // 예시: 주문된 상품 수량만큼 재고를 복구하는 로직이 필요합니다.

    await order.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      message: `주문 ${order.orderNumber}이 성공적으로 취소되었습니다. (상태: cancelled)`,
      orderId: order._id,
      status: order.status,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error cancelling order:", error);
    res
      .status(500)
      .json({ message: "주문 취소 처리 중 서버 오류가 발생했습니다." });
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
    return res.status(400).json({ message: "유효하지 않은 주문 ID입니다." });
  }

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "해당 주문을 찾을 수 없습니다." });
    }

    if (order.status !== "paid") {
      return res.status(400).json({
        message: `상품 준비는 'paid'(결제 완료) 상태에서만 가능합니다. (현재 상태: ${order.status})`,
      });
    }

    // 💡 핵심 로직: 상태를 'processing'(상품 준비 중)으로 변경
    order.status = "processing";
    await order.save();

    res.status(200).json({
      message: `주문 ${order.orderNumber}이 'processing'(상품 준비 중)으로 변경되었습니다.`,
      orderId: order._id,
      status: order.status,
    });
  } catch (error) {
    console.error("Error starting preparation:", error);
    res
      .status(500)
      .json({ message: "상품 준비 시작 처리 중 서버 오류가 발생했습니다." });
  }
};

// =================================================================
// 8. 배송 시작 처리 (PATCH /api/orders/:id/shipping) - 관리자 전용
//    상태: processing -> shipped
// =================================================================
export const startShipping = async (req, res) => {
  // 함수 이름 변경 및 로직 수정
  const orderId = req.params.id;
  const { courierName, trackingNumber } = req.body;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ message: "유효하지 않은 주문 ID입니다." });
  }
  if (!courierName || !trackingNumber) {
    return res.status(400).json({
      message: "배송 시작을 위해 택배사 이름과 운송장 번호가 모두 필요합니다.",
    });
  }

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "해당 주문을 찾을 수 없습니다." });
    }

    // 💡 핵심 수정: 배송 시작은 'processing' 상태에서만 가능합니다.
    if (order.status !== "processing") {
      return res.status(400).json({
        message: `배송 시작은 'processing'(상품 준비 중) 상태에서만 가능합니다. (현재 상태: ${order.status})`,
      });
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
  } catch (error) {
    console.error("Error starting shipping:", error);
    res
      .status(500)
      .json({ message: "배송 시작 처리 중 서버 오류가 발생했습니다." });
  }
};

// =================================================================
// 9. 배송 완료 처리 (PATCH /api/orders/:id/complete) - 관리자 전용
//    상태: shipped -> delivered
// =================================================================
export const completeDelivery = async (req, res) => {
  const orderId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ message: "유효하지 않은 주문 ID입니다." });
  }

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "해당 주문을 찾을 수 없습니다." });
    }

    if (order.status !== "shipped") {
      return res.status(400).json({
        message: `배송 완료는 'shipped'(배송 중) 상태에서만 처리할 수 있습니다. (현재 상태: ${order.status})`,
      });
    }

    // 💡 핵심 로직: 상태를 'delivered'(배송 완료)로 변경
    order.status = "delivered";
    order.deliveredAt = new Date(); // 배송 완료 시점 기록
    await order.save();

    res.status(200).json({
      message: `주문 ${order.orderNumber}이 'delivered'(배송 완료) 처리되었습니다.`,
      orderId: order._id,
      status: order.status,
    });
  } catch (error) {
    console.error("Error completing delivery:", error);
    res
      .status(500)
      .json({ message: "배송 완료 처리 중 서버 오류가 발생했습니다." });
  }
};
