import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    recipientName: {
      type: String,
      required: true,
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
