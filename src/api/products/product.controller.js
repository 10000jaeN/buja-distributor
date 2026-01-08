import Product from "./product.model.js";
import CustomError from "../../utils/customError.js";
import slugify from "../../utils/slugify.js";

/**
 * POST /products - 새 상품 등록 (관리자 전용)
 * req.body에서 상품 정보를 받아 DB에 저장합니다.
 */
export const createProduct = async (req, res) => {
  try {
    const { name, price, category, thumbnail, contentBlocks } = req.body;

    // 1. 서버에서 필요한 데이터 생성
    const generatedSlug = slugify(name);

    // 2. 계층형 카테고리를 위한 path 생성
    const categoryPath = [category.parent, category.child];

    // 3. 최종 객체 조립 (보안을 위해 필드를 직접 지정)
    const productData = {
      name,
      price,
      thumbnail,
      contentBlocks,
      slug: generatedSlug,
      category: {
        ...category,
        path: categoryPath,
      },
    };

    // 4. DB 저장
    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();

    return res.status(201).json({
      message: "상품이 성공적으로 등록되었습니다.",
      data: savedProduct,
    });
  } catch (error) {
    // 중복 슬러그 에러 처리 (11000은 MongoDB 중복 키 에러 코드)
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "이미 존재하는 상품 이름입니다." });
    }
    return res.status(500).json({ message: "서버 에러", error: error.message });
  }
};

/**
 * GET /products - 상품 목록 전체 조회
 */
export const getProducts = async (req, res) => {
  const products = await Product.find();
  return res.send(products);
};

/**
 * GET /products/:slug - 특정 상품 상세 조회
 * (req.productId는 checkProductId 미들웨어에서 세팅됨)
 */
export const getProductBySlug = async (req, res) => {
  const { slug } = req.params;
  const product = await Product.findByOne(slug);

  if (!product) {
    // 💡 CustomError 사용: 상태 코드와 메시지를 함께 던집니다.
    throw new CustomError(`슬러그: ${slug} 상품을 찾을 수 없습니다.`, 404);
  }
  return res.status(200).json({ data: product });
};

/**
 * PATCH /products/:id - 특정 상품 정보 수정 (관리자 전용)
 * (req.productId는 checkProductId 미들웨어에서 세팅됨)
 */
export const patchProduct = async (req, res) => {
  const updatedProduct = await Product.findByOneAndUpdate(
    { slug: req.params.slug },
    req.body, // 클라이언트가 보낸 전체/부분 데이터
    {
      new: true, // 업데이트된 문서를 반환하도록 설정
      runValidators: true, // 업데이트 시 스키마 유효성 검사 실행
    }
  );

  if (!updatedProduct) {
    // 💡 CustomError 사용
    throw new CustomError(`슬러그: ${req.slug} 상품을 찾을 수 없습니다.`, 404);
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
  const { slug } = req.params;
  const deletedProduct = await Product.findByOneAndDelete({ slug });

  if (!deletedProduct) {
    // 💡 CustomError 사용
    throw new CustomError(
      `슬러그: ${req.params.slug} 상품을 찾을 수 없습니다.`,
      404
    );
  }
  return res.sendStatus(204);
};
