import Product from "./product.model.js";

/**
 * POST /products - 새 상품 등록 (관리자 전용)
 * req.body에서 상품 정보를 받아 DB에 저장합니다.
 */
export const createProduct = async (req, res) => {
  // 클라이언트가 보낸 데이터로 새로운 상품 인스턴스 생성
  const newProduct = new Product(req.body);

  // DB에 저장
  const savedProduct = await newProduct.save();

  // 201 Created 응답 반환
  return res.status(201).json({
    message: "상품이 성공적으로 등록되었습니다.",
    data: savedProduct,
  });
};

/**
 * GET /products - 상품 목록 전체 조회
 */
export const getProducts = async (req, res) => {
  const products = await Product.find();
  return res.send(products);
};

/**
 * GET /products/:id - 특정 상품 상세 조회
 * (req.productId는 checkProductId 미들웨어에서 세팅됨)
 */
export const getProductById = async (req, res) => {
  const product = await Product.findById(req.productId);

  if (!product) {
    const error = new Error(`ID: ${req.productId} 상품을 찾을 수 없습니다.`);
    error.status = 404;
    throw error;
  }
  return res.status(200).json({ data: product });
};

/**
 * PATCH /products/:id - 특정 상품 정보 수정 (관리자 전용)
 * (req.productId는 checkProductId 미들웨어에서 세팅됨)
 */
export const patchProduct = async (req, res) => {
  const updatedProduct = await Product.findByIdAndUpdate(
    req.productId,
    req.body, // 클라이언트가 보낸 전체/부분 데이터
    {
      new: true, // 업데이트된 문서를 반환하도록 설정
      runValidators: true, // 업데이트 시 스키마 유효성 검사 실행
    }
  );

  if (!updatedProduct) {
    const error = new Error(`ID: ${req.productId} 상품을 찾을 수 없습니다.`);
    error.status = 404;
    throw error;
  }

  return res.status(200).json({
    message: "상품이 성공적으로 수정되었습니다. (PATCH)",
    data: updatedProduct,
  });
};

/**
 * DELETE /products/:id - 특정 상품 삭제 (관리자 전용)
 * (req.productId는 checkProductId 미들웨어에서 세팅됨)
 */
export const deleteProduct = async (req, res) => {
  const deletedProduct = await Product.findByIdAndDelete(req.productId);

  if (!deletedProduct) {
    const error = new Error(`ID: ${req.productId} 상품을 찾을 수 없습니다.`);
    error.status = 404;
    throw error;
  }
  return res.sendStatus(204);
};
