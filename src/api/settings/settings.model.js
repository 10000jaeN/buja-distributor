import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    // 싱글톤 식별자 (항상 "global" 하나만 존재)
    key: {
      type: String,
      default: "global",
      unique: true,
    },
    // 묶음배송 무료 기준금액
    bundleFreeThreshold: {
      type: Number,
      default: 50000,
      min: [0, "기준금액은 0 이상이어야 합니다."],
    },
  },
  { timestamps: true }
);

const Settings = mongoose.model("Settings", SettingsSchema);
export default Settings;
