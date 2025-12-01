import express from "express";
import Product from "./product.model.js";
import asyncHandler from "../../utils/asyncHandler.js";

const router = express.Router();

/**
 * 💡 라우트 미들웨어: URL 파라미터에서 ID를 추출하고 유효성을 검사합니다.
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
const checkProductId = (req, res, next) => {
  const id = req.params.id;

  // 1. 유효성 검사 (예: ID가 존재하지 않는 경우)
  if (!id) {
    const error = new Error("요청 경로에 ID 파라미터가 누락되었습니다.");
    error.status = 400; // Bad Request
    return next(error);
  }

  // 2. req 객체에 저장: 다른 핸들러에서 쉽게 접근할 수 있도록 합니다.
  req.productId = id;

  // 3. 다음 핸들러로 넘어갑니다.
  next();
};

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const products = await Product.find();

    return res.send(products);
  })
);

router
  .route("/:id")
  .all(checkProductId) // 💡 GET, PATCH, DELETE 모든 HTTP 메서드에 적용

  .get(
    asyncHandler(async (req, res) => {
      // 이제 req.params.id 대신 req.productId를 사용합니다.
      const product = await Product.findById(req.productId);

      if (!product) {
        const error = new Error(
          `ID: ${req.productId} 상품을 찾을 수 없습니다.`
        );
        error.status = 404;
        throw error;
      }
      return res.status(200).json({ data: product });
    })
  )

  // 💡 PUT 대신 PATCH 메서드 사용: 부분 수정이 기본이므로 PATCH를 사용합니다.
  .patch(
    asyncHandler(async (req, res) => {
      // Mongoose의 findByIdAndUpdate는 클라이언트가 보낸 데이터만 업데이트하며,
      // createdAt은 안전하게 유지됩니다.

      const updatedProduct = await Product.findByIdAndUpdate(
        req.productId,
        req.body, // 클라이언트가 보낸 전체/부분 데이터
        {
          new: true, // 업데이트된 문서를 반환하도록 설정
          runValidators: true, // 업데이트 시 스키마 유효성 검사 실행
        }
      );

      if (!updatedProduct) {
        const error = new Error(
          `ID: ${req.productId} 상품을 찾을 수 없습니다.`
        );
        error.status = 404;
        throw error;
      }

      return res.status(200).json({
        message: "상품이 성공적으로 수정되었습니다. (PATCH)",
        data: updatedProduct,
      });
    })
  )

  .delete(
    asyncHandler(async (req, res) => {
      const deletedProduct = await Product.findByIdAndDelete(req.productId);

      if (!deletedProduct) {
        const error = new Error(
          `ID: ${req.productId} 상품을 찾을 수 없습니다.`
        );
        error.status = 404;
        throw error;
      }
      return res.sendStatus(204);
    })
  );

export default router;
