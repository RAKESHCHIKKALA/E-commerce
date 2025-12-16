const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    stock: { type: Number, required: true, min: 0 },
    sizes: [String],
    category: { type: String, default: "" },
    subcategory: { type: String, default: "" },
    brand: { type: String, default: "" },
    color: { type: String, default: "" },
    altColors: [String],
    images: [String], // gallery images
    videos: [String],
    // keep legacy single image field for compatibility
    image: { type: String, default: "" }, // stored path under /uploads
    colorVariants: [
      {
        color: { type: String, required: true },
        images: [String],
      },
    ],
    highlightPoints: { type: String, default: "" }, // newline separated bullets
    featurePoints: { type: String, default: "" }, // newline separated bullets
    material: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
