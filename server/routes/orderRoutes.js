const router = require("express").Router();
const Order = require("../models/ordermodel");
const Product = require("../models/productmodel");
const verifyAdmin = require("../middleware/verifyAdmin");
const verifyUser = require("../middleware/verifyUser"); // optional for user routes

// User: create order & decrement stock
router.post("/", verifyUser, async (req, res) => {
  try {
    const { products = [], totalPrice = 0 } = req.body; // [{product, quantity}]
    if (!Array.isArray(products) || !products.length) {
      return res.status(400).json({ error: "No products provided" });
    }

    // Fetch products and validate stock
    const productDocs = await Product.find({
      _id: { $in: products.map((p) => p.product) },
    });
    const productMap = new Map(productDocs.map((p) => [p._id.toString(), p]));

    for (const item of products) {
      const doc = productMap.get(item.product);
      if (!doc) return res.status(404).json({ error: "Product not found" });
      if (doc.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${doc.name}` });
      }
    }

    // Decrement stock
    for (const item of products) {
      const doc = productMap.get(item.product);
      doc.stock -= item.quantity;
      await doc.save();
    }

    const order = await Order.create({
      user: req.user.id,
      products,
      totalPrice,
      status: "Pending",
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get all orders
router.get("/admin", verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("products.product", "name price");
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Admin: Update order status
router.put("/admin/:id", verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("user", "name email")
      .populate("products.product", "name price");
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Optional: User can get their orders
router.get("/myorders", verifyUser, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("products.product", "name price");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
