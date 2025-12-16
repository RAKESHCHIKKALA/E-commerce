const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    isAdmin: { type: Boolean, default: false },
    phone: { type: String, default: "" },
    addresses: [
      {
        label: { type: String, default: "Home" },
        line1: String,
        line2: String,
        city: String,
        state: String,
        zip: String,
      },
    ],
    cart: [cartItemSchema],
});

module.exports = mongoose.model("User", userSchema);
