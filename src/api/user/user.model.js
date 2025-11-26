import mongoose from "mongoose";
import AddressSchema from "../../models/schemas/AddressSchema";

const UserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    roles: {
      type: [String],
      enum: ["user", "admin"],
      default: ["user"],
    },
    address: [AddressSchema],
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;
