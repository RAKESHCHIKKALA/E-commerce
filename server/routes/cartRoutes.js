const router = require("express").Router();
const Product = require("../models/productmodel");
const Cart = require("../models/cartmodel");
const verifyUser = require("../middleware/verifyuser");

// All cart routes require authenticated non-admin user
router.use(verifyUser, (req, res, next) => {
  if (req.user?.isAdmin) {
    return res.status(403).json({ error: "Admins cannot access the cart" });
  }
  next();
});

// Helpers
const getOrCreateCart = async (userId) => {
  const existing = await Cart.findOne({ user: userId });
  if (existing) return existing;
  const created = new Cart({ user: userId, items: [] });
  await created.save();
  return created;
};

const populateCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  await cart.populate("items.product");
  return cart.items;
};

// Get cart
router.get("/", async (req, res) => {
  try {
    const cart = await populateCart(req.user.id);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add to cart (or increment)
router.post("/", async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const qty = Math.max(1, Number(quantity) || 1);

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const cart = await getOrCreateCart(req.user.id);
    const existing = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existing) {
      existing.quantity += qty;
    } else {
      cart.items.push({ product: productId, quantity: qty });
    }

    await cart.save();
    const items = await populateCart(req.user.id);
    res.status(201).json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update quantity
router.put("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const qty = Number(req.body.quantity);

    const cart = await getOrCreateCart(req.user.id);
    const item = cart.items.find((c) => c.product.toString() === productId);

    if (!item) return res.status(404).json({ error: "Item not in cart" });

    if (!qty || qty < 1) {
      cart.items = cart.items.filter((c) => c.product.toString() !== productId);
    } else {
      item.quantity = qty;
    }

    await cart.save();
    const items = await populateCart(req.user.id);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove item
router.delete("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await getOrCreateCart(req.user.id);

    const before = cart.items.length;
    cart.items = cart.items.filter((c) => c.product.toString() !== productId);

    if (cart.items.length === before) {
      return res.status(404).json({ error: "Item not in cart" });
    }

    await cart.save();
    const items = await populateCart(req.user.id);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// CHECK IF A PRODUCT IS IN CART
router.get("/check/:productId", async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) return res.json({ inCart: false });

    const exists = cart.items.some(
      (item) => item.product.toString() === productId
    );

    res.json({ inCart: exists });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;


