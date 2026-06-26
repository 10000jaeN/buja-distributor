import mongoose from "mongoose";

const qnaSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minLength: [5, "문의 내용은 최소 5자 이상 작성해야 합니다."],
    },
    isSecret: {
      type: Boolean,
      default: false,
    },
    answer: {
      type: String,
      trim: true,
      default: null,
    },
    answeredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Qna = mongoose.models.Qna || mongoose.model("Qna", qnaSchema);
export default Qna;
