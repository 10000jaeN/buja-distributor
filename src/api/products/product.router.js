import express from "express";
import Product from "./product.model.js";

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("상품 목록 요청이 처리되었습니다.");

  const products = await Product.find();

  return res.send(products);
});

export default router;
