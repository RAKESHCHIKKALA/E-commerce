const express = require("express");
const router = express.Router();
const Product = require("../models/productmodel");
const User = require("../models/usermodel");
const Order = require("../models/ordermodel");

// GET admin dashboard stats
router.get("/stats", async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();

    const revenueData = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    const latestOrders = await Order.find().sort({ createdAt: -1 }).limit(5)
      .populate("user", "name email")
      .populate("products.product", "name");

    res.json({
      totalProducts,
      totalUsers,
      totalOrders,
      totalRevenue,
      latestOrders
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log(err);
  }
});

module.exports = router;
