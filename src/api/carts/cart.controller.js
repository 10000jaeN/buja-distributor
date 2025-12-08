import Cart from "./cart.model.js";
import Product from "../products/product.model.js"; // Product 모델이 있다고 가정
import CustomError from "../../utils/customError.js"; // CustomError 임포트

// =================================================================
// 1. 사용자 장바구니 조회 (GET /carts)
// 장바구니가 없으면 빈 목록 반환
// =================================================================
export const getCart = async (req, res) => {
  const userId = req.user.id;

  // 사용자 ID로 장바구니를 찾고 상품 세부 정보 채우기
  const cart = await Cart.findOne({ user: userId })
    .populate("items.productId", "name price stock isAvailable imageUrl")
    .select("-__v"); // 불필요한 필드 제거

  if (!cart) {
    // 장바구니를 찾을 수 없으면 빈 장바구니 구조 반환
    return res.status(200).json({
      message: "장바구니가 비어 있습니다.",
      data: {
        items: [],
      },
    });
  }

  // 편의를 위해 총액 계산
  const totalAmount = cart.items.reduce((total, item) => {
    // 상품 세부 정보가 성공적으로 채워진 경우에만 계산
    if (item.productId) {
      return total + item.productId.price * item.quantity;
    }
    return total;
  }, 0);

  res.status(200).json({
    message: "장바구니 정보가 성공적으로 조회되었습니다.",
    data: {
      items: cart.items,
      totalAmount,
    },
  });
};

// =================================================================
// 2. 장바구니에 상품 추가/수량 증가 (POST /carts)
// =================================================================
export const addItemToCart = async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  if (!productId || typeof quantity !== "number" || quantity <= 0) {
    throw new CustomError(
      "유효한 상품 ID와 1개 이상의 수량이 필요합니다.",
      400
    );
  }

  // 1. 상품 존재 및 재고 확인
  const product = await Product.findById(productId);
  if (!product || !product.isAvailable) {
    throw new CustomError(
      "해당 상품을 찾을 수 없거나 현재 구매할 수 없습니다.",
      404
    );
  }

  const cart = await Cart.findOne({ user: userId });

  // 2. 장바구니가 없는 경우 새로 생성
  if (!cart) {
    // 재고확인 생략
    const newCart = await Cart.create({
      user: userId,
      items: [{ productId, quantity }],
    });
    return res.status(201).json({
      message: "새 장바구니에 상품이 성공적으로 추가되었습니다.",
      data: newCart,
    });
  }

  // 3. 기존 장바구니에 상품이 있는지 확인
  const existingItemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (existingItemIndex > -1) {
    // 4. 상품이 이미 있는 경우 수량 증가
    const currentQuantity = cart.items[existingItemIndex].quantity;
    const newQuantity = currentQuantity + quantity;

    // 재고 한도 확인 생략

    cart.items[existingItemIndex].quantity = newQuantity;
    await cart.save();
    return res.status(200).json({
      message: "장바구니에 기존 상품 수량이 성공적으로 업데이트되었습니다.",
      data: cart,
    });
  } else {
    // 5. 상품이 없는 경우 새로 추가
    // 재고 확인 생략
    cart.items.push({ productId, quantity });
    await cart.save();
    return res.status(201).json({
      message: "장바구니에 새 상품이 성공적으로 추가되었습니다.",
      data: cart,
    });
  }
};

// =================================================================
// 3. 장바구니 상품 수량 변경 (PATCH /carts/:productId)
// =================================================================
export const updateCartItemQuantity = async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.productId;
  const { quantity } = req.body;

  // 1. 수량 유효성 검사
  if (typeof quantity !== "number" || quantity < 1) {
    throw new CustomError(
      "수량 변경은 최소 1개부터 가능합니다. 상품을 제거하려면 DELETE 요청을 사용하세요.",
      400
    );
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new CustomError("장바구니를 찾을 수 없습니다.", 404);
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (existingItemIndex === -1) {
    throw new CustomError(
      "상품 정보를 찾을 수 없거나 판매가 중단되었습니다.",
      404
    );
  }

  // 5. 수량 변경 및 저장
  cart.items[existingItemIndex].quantity = quantity;
  await cart.save();
  return res.status(200).json({
    message: `상품의 수량이 ${quantity}로 성공적으로 변경되었습니다.`,
    data: cart,
  });
};

// =================================================================
// 4. 장바구니에서 복수 상품 제거 (POST /carts/remove-items)
// productId 대신 productIds 배열을 받도록 수정
// =================================================================
export const removeCartItems = async (req, res) => {
  const userId = req.user.id;
  // 요청 본문에서 제거할 상품 ID 배열을 받습니다.
  const { productIds } = req.body;

  // 1. 입력 유효성 검사
  if (!Array.isArray(productIds) || productIds.length === 0) {
    throw new CustomError(
      "제거할 상품 ID 목록(productIds 배열)이 필요합니다.",
      400
    );
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    // 장바구니를 찾을 수 없으면 이미 비어있는 것으로 간주하여 성공 응답
    return res.status(200).json({ message: "장바구니가 이미 비어있습니다." });
  }

  // 2. $pullAll 연산자를 사용하여 배열에서 해당 ID 목록에 포함된 모든 항목을 제거
  // Mongoose/MongoDB에서 배열 내의 객체를 효율적으로 제거하는 방법입니다.
  const updateResult = await Cart.updateOne(
    { user: userId },
    { $pull: { items: { productId: { $in: productIds } } } },
    { timestamps: false }
  );

  // 3. 수정된 항목이 없으면 일부 또는 전부가 이미 제거되었거나 존재하지 않는 것입니다.
  // 이 경우 사용자에게 오류보다는 성공 메시지를 반환합니다.
  // 왜냐하면 사용자의 '제거' 목적은 달성되었기 때문입니다.
  if (updateResult.modifiedCount === 0) {
    return res.status(200).json({
      message: "제거 요청된 상품 중 장바구니에 남아있는 상품이 없습니다.",
      data: cart,
    });
  }

  // 변경 후 장바구니 데이터를 다시 조회하여 응답에 포함 (선택 사항)
  const updatedCart = await Cart.findOne({ user: userId });

  res.status(200).json({
    message: "선택된 상품들이 장바구니에서 성공적으로 제거되었습니다.",
    data: updatedCart,
  });
};
