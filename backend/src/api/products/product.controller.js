import Product from "./product.model.js";
import CustomError from "../../utils/customError.js";
import slugify from "../../utils/slugify.js";

/**
 * POST /products - 새 상품 등록 (관리자 전용)
 * req.body에서 상품 정보를 받아 DB에 저장합니다.
 */
export const createProduct = async (req, res) => {
  try {
    const { name, price, shippingFee, freeShippingThreshold, category, thumbnail, contentBlocks, contentBlock, content, isAvailable, stock } = req.body;

    // 1. 서버에서 필요한 데이터 생성
    const generatedSlug = slugify(name);

    // 2. 계층형 카테고리를 위한 path 생성
    const categoryPath = [category.parent, category.child];

    // 3. 최종 객체 조립 (보안을 위해 필드를 직접 지정)
    const productData = {
      name,
      price,
      thumbnail,
      content: content ?? "",
      contentBlock: contentBlock ?? contentBlocks ?? [],
      slug: generatedSlug,
      category: {
        ...category,
        path: categoryPath,
      },
      ...(shippingFee !== undefined && { shippingFee }),
      ...(freeShippingThreshold !== undefined && { freeShippingThreshold }),
      ...(isAvailable !== undefined && { isAvailable }),
      ...(stock !== undefined && { stock: stock === null ? null : Number(stock) }),
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
  try {
    const { sort, limit, category, sub, q, freeShipping } = req.query;

    const query = {};
    if (category) query["category.parent"] = category;
    if (sub) query["category.child"] = sub;
    if (q) query["name"] = { $regex: q, $options: "i" };
    if (freeShipping === "true") query["shippingFee"] = 0;

    const sortMap = {
      // 최신 순
      recent: { createdAt: -1 },

      // 인기순
      populate: { "stats.reviewCount": -1, "stats.ratingAverage": -1 },

      // 베스트 상품 (별점 → 판매량 → 리뷰수)
      best: { "stats.ratingAverage": -1, "stats.orderCount": -1, "stats.reviewCount": -1 },

      // 가격순
      price_asc: { price: 1 },
      price_desc: { price: -1 },
    };

    const sortOption = sortMap[sort] || { createdAt: -1 };

    const products = await Product.find(query)
      .sort(sortOption)
      .limit(Number(limit));
    return res.json({
      message: "성공적으로 상품을 조회하였습니다.",
      data: products,
    });
  } catch (error) {
    return res.status(500).json({ message: "서버 에러", error: error.message });
  }
};

/**
 * GET /products/categories - 카테고리 목록 조회
 */
export const getCategories = async (req, res) => {
  const result = await Product.aggregate([
    { $match: { "category.parent": { $exists: true } } },
    {
      $group: {
        _id: "$category.parent",
        children: { $addToSet: "$category.child" },
      },
    },
    { $project: { _id: 0, parent: "$_id", children: 1 } },
    { $sort: { parent: 1 } },
  ]);

  return res.status(200).json({ data: result });
};

/**
 * GET /products/:slug - 특정 상품 상세 조회
 * (req.productId는 checkProductId 미들웨어에서 세팅됨)
 */
export const getProductBySlug = async (req, res) => {
  const { slug } = req.params;
  const product = await Product.findOne({ slug });

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
  const { slug } = req.params;
  const updateData = { ...req.body };

  // 1. 만약 바디에 name이 포함되어 있다면 슬러그를 새로 생성
  if (updateData.name) {
    updateData.slug = slugify(updateData.name);
  }

  // 2. stock이 1 이상으로 업데이트되면 isAvailable을 자동으로 true로 설정
  // (단, 요청에서 isAvailable을 명시적으로 false로 전달한 경우는 제외)
  if (
    updateData.stock !== undefined &&
    updateData.stock !== null &&
    Number(updateData.stock) >= 1 &&
    updateData.isAvailable !== false
  ) {
    updateData.isAvailable = true;
  }

  // 2. findOneAndUpdate로 업데이트
  const updatedProduct = await Product.findOneAndUpdate(
    { slug: slug },
    updateData,
    {
      new: true, // 업데이트된 문서를 반환하도록 설정
      runValidators: true, // 업데이트 시 스키마 유효성 검사 실행
    }
  );

  if (!updatedProduct) {
    throw new CustomError(`슬러그: ${slug} 상품을 찾을 수 없습니다.`, 404);
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
  const deletedProduct = await Product.findOneAndDelete({ slug });

  if (!deletedProduct) {
    // 💡 CustomError 사용
    throw new CustomError(
      `슬러그: ${req.params.slug} 상품을 찾을 수 없습니다.`,
      404
    );
  }
  return res.sendStatus(204);
};
