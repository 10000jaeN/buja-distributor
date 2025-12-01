import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    recipientName: {
      // 수령인 이름
      type: String,
      // required: true,
    },
    phoneNumber: {
      // 전화번호
      type: String,
      // required: true,
    },
    zipCode: {
      // 우편번호
      type: String,
      // required: true,
    },
    mainAddress: {
      // 기본 주소
      type: String,
      // required: true,
    },
    detailAddress: {
      // 상세 주소
      type: String,
    },
    jibunAddress: {
      // 지번 주소
      type: String,
    },
    isDefault: {
      // 기본 설정 여부
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

export default AddressSchema;
