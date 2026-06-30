import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    recipientName: {
      type: String,
      required: true,
      maxlength: [20, "수령인 이름은 20자 이내여야 합니다."],
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    mainAddress: {
      type: String,
      required: true,
    },
    detailAddress: {
      type: String,
      maxlength: [50, "상세 주소는 50자 이내여야 합니다."],
    },
    jibunAddress: {
      type: String,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {}
);

export default AddressSchema;
