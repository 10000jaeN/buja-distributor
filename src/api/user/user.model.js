import mongoose from "mongoose";
// 💡 리소스 기반 구조에 따라 경로 조정: user/model.js -> utils/crypto.js
import { encryptToken, decryptToken } from "../../utils/crypto.js";
import AddressSchema from "../../models/schemas/AddressSchema.js"; // 사용자님의 기존 경로 유지

const UserSchema = new mongoose.Schema(
  {
    // 1. OAuth 식별자 (필수)
    provider: {
      type: String,
      required: true,
      enum: ["local", "google", "kakao", "naver"],
    },
    providerId: {
      type: String,
      required: true,
    },

    // 2. 기본 정보
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
      unique: false,
    },

    // 3. 권한 및 기타 정보
    roles: {
      type: [String],
      enum: ["user", "admin"],
      default: ["user"],
    },
    address: [AddressSchema],

    // 💡 5. OAuth 토큰 - 리프레시 토큰 필드 추가 및 Getter/Setter 적용
    refreshToken: {
      type: String,
      required: false,
      // DB에 저장할 때: crypto.js의 encryptToken 함수를 통해 암호화
      set: encryptToken,
      // DB에서 불러올 때: crypto.js의 decryptToken 함수를 통해 복호화
      get: decryptToken,
    },
  },
  {
    timestamps: true,
    // 💡 Getter를 활성화하여 DB에서 토큰을 가져올 때 복호화 함수(get)가 실행되도록 합니다.
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// 💡 중요: provider와 providerId 쌍의 유일성(Unique)을 보장하는 인덱스 설정
UserSchema.index({ provider: 1, providerId: 1 }, { unique: true });

const User = mongoose.model("User", UserSchema);
export default User;
