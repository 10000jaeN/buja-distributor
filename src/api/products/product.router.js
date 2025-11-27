import express from "express";
import Product from "./product.model.js";
import asyncHandler from "../../utils/asyncHandler.js";

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const products = await Product.find();

    return res.send(products);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const newProduct = await Product.create(req.body);

    return res.status(201).send(newProduct);
  })
);

export default router;
