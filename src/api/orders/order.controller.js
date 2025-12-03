import Order from "./order.model.js";
import Product from "../products/product.model.js";
import User from "../user/user.model.js";
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
// 1. 새 주문 생성 (POST /api/orders)
// =================================================================
export const createOrder = async (req, res) => {
  // 1. 유효성 검사 및 데이터 추출
  const { items, shippingAddress } = req.body;
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
      orderNumber, // 💡 주문번호 추가
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
