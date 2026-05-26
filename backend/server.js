import "dotenv/config"; // dotenv/config로 환경 변수 로드

import mongoose from "mongoose";
import express from "express";
import cookieParser from "cookie-parser"; // 💡 토큰 테스트를 위한 쿠키 파서 추가
import passport from "passport";
import cors from "cors";

import productRouter from "./src/api/products/product.routes.js";
import categoryRouter from "./src/api/categories/category.routes.js";
import authRouter from "./src/api/auth/auth.routes.js";
import userRouter from "./src/api/user/user.routes.js";
import orderRouter from "./src/api/orders/order.routes.js";
import cartRouter from "./src/api/carts/cart.route.js";
import reviewRouter from "./src/api/reviews/review.route.js";
import settingsRouter from "./src/api/settings/settings.routes.js";
import paymentsRouter from "./src/api/payments/payments.routes.js";
import { setupPassport } from "./src/config/passport.config.js";

import "./src/api/user/user.model.js"; // 모델을 Mongoose에 등록하여 스키마 사용 가능하도록 함
import "./src/api/products/product.model.js";
import "./src/api/orders/order.model.js";

const app = express();
app.set("trust proxy", 1);

setupPassport();

app.use(express.json());
app.use(cookieParser()); // 쿠키 파서 추가

//CORS 상세 설정
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const PORT = process.env.PORT || 4000;
const DB_URI = process.env.MONGO_URI;

app.use(passport.initialize());

app.use("/products", productRouter);
app.use("/categories", categoryRouter);
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/orders", orderRouter);
app.use("/carts", cartRouter);
app.use("/reviews", reviewRouter);
app.use("/settings", settingsRouter);
app.use("/payments", paymentsRouter);

// 전역 에러 핸들러 (asyncHandler를 쓸 때 필수!)
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "서버 내부 오류",
  });
});

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
