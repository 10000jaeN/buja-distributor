import mongoose from "mongoose";

const PopupSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    linkUrl: { type: String, default: null },
    couponCode: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
  },
  { timestamps: true }
);

const Popup = mongoose.model("Popup", PopupSchema);
export default Popup;
