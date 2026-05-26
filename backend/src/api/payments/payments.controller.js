import Order from "../orders/order.model.js";
import CustomError from "../../utils/customError.js";

// =================================================================
// 결제 승인 (POST /payments/confirm)
// Toss 서버에 최종 승인 요청 후 주문 상태를 paid로 변경
// =================================================================
export const confirmPayment = async (req, res) => {
  const { paymentKey, orderId, amount } = req.body;

  if (!paymentKey || !orderId || !amount) {
    throw new CustomError("paymentKey, orderId, amount가 필요합니다.", 400);
  }

  // 1. 주문 조회 및 검증
  const order = await Order.findById(orderId);
  if (!order) {
    throw new CustomError("주문을 찾을 수 없습니다.", 404);
  }
  if (order.status !== "pending") {
    throw new CustomError("이미 처리된 주문입니다.", 400);
  }

  // 2. 금액 위변조 방지 — DB 금액과 일치 확인
  if (order.totalAmount !== Number(amount)) {
    throw new CustomError("결제 금액이 주문 금액과 일치하지 않습니다.", 400);
  }

  // 3. Toss 서버에 최종 승인 요청
  const secretKey = process.env.TOSS_SECRET_KEY;
  const encodedKey = Buffer.from(`${secretKey}:`).toString("base64");

  const tossRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Basic ${encodedKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
  });

  const tossData = await tossRes.json();

  if (!tossRes.ok) {
    throw new CustomError(
      tossData.message || "결제 승인에 실패했습니다.",
      tossRes.status
    );
  }

  // 4. 주문 상태 업데이트
  order.status = "paid";
  order.paidAt = new Date();
  order.paymentKey = paymentKey;
  order.paymentMethod = tossData.method;
  order.paymentProvider = tossData.easyPay?.provider ?? null;
  await order.save();

  res.status(200).json({
    message: "결제가 완료되었습니다.",
    orderId: order._id,
    orderNumber: order.orderNumber,
    paymentMethod: order.paymentMethod,
    paymentProvider: order.paymentProvider,
  });
};
