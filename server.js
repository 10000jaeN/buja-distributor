import "dotenv/config";

import mongoose from "mongoose";
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;
const DB_URI = process.env.DATABASE;

app.use(express.json());

app.listen(PORT, () => console.log("Server Started"));
mongoose
  .connect(DB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    // 3. DB 연결 성공 시에만 서버 시작
    app.listen(PORT, () => {
      console.log(`✅ Server start in http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    // 4. DB 연결 실패 시 에러 출력 및 프로세스 종료
    console.error("❌ MongoDB 연결 오류:", err.message);
    process.exit(1);
  });

app.get("/products", (req, res) => {
  return req;
});
