import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    parent: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    children: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", CategorySchema);
export default Category;
