import "dotenv/config"; // dotenv/config로 환경 변수 로드

import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser"; // 💡 토큰 테스트를 위한 쿠키 파서 추가
import productRouter from "./src/api/products/product.routes.js";
import authRouter from "./src/api/auth/auth.routes.js";
import userRouter from "./src/api/user/user.routes.js";
import orderRouter from "./src/api/orders/order.routes.js";

import "./src/api/user/user.model.js"; // 모델을 Mongoose에 등록하여 스키마 사용 가능하도록 함
import "./src/api/products/product.model.js";
import "./src/api/orders/order.model.js";

const app = express();
const PORT = process.env.PORT || 3000;
const DB_URI = process.env.MONGO_URI; // DATABASE 대신 MONGO_URI를 권장합니다.

app.use(express.json());
app.use(cookieParser()); // 쿠키 파서 추가

app.use("/products", productRouter);
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/orders", orderRouter);

// ----------------------------------------------------
// 안정적인 서버 시작 로직
// ----------------------------------------------------
app.get("/", (req, res) => {
  res.send("Server is running. Access /api/auth/login to test.");
});

// 1. MongoDB 연결 시도
mongoose
  .connect(DB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    // 2. DB 연결 성공 시에만 서버 시작 (이전의 중복 app.listen 제거)
    app.listen(PORT, () => {
      console.log(`✅ Server start in http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    // 3. DB 연결 실패 시 에러 출력 및 프로세스 종료
    console.error("❌ MongoDB 연결 오류:", err.message);
    process.exit(1);
  });
