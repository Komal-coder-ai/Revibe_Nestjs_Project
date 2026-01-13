import { Schema, model, models } from "mongoose";

const ProductSchema = new Schema(
  {
    title: { type: String, default: "" },
    link: { type: String, default: "" },
    storeId: { type: Schema.Types.ObjectId, ref: "Store" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    image: {
      type: [
        {
          imageUrl: { type: String, default: '' },
          thumbUrl: { type: String, trim: true, default: '' },
          type: { type: String, trim: true, default: '' },
          width: { type: String, trim: true, default: '' },
          height: { type: String, trim: true, default: '' },
          orientation: { type: String, trim: true, default: '' },
          format: { type: String, trim: true, default: '' },
        }
      ],
      default: [],
    },
  },
  { timestamps: true }
);

// Export model safely for Next.js
export default models.Product || model("Product", ProductSchema);
