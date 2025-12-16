const router = require("express").Router();
const User = require("../models/usermodel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.SECRET_KEY;

/* ============================================================
   REGISTER
============================================================ */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check existing email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isAdmin: false // default
    });

    // Generate token with isAdmin
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User Registered Successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });

  } catch (error) {
    console.log("Register Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ============================================================
   LOGIN
============================================================ */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    // Check password match
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid password" });

    // Generate JWT including isAdmin
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });

  } catch (error) {
    console.log("Login Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ============================================================
   GET LOGGED-IN USER DATA
============================================================ */
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader)
    return res.status(401).json({ error: "Unauthorized - No Token" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user from DB
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    return res.status(401).json({ error: "Invalid Token" });
  }
});

/* ============================================================
   UPDATE LOGGED-IN USER DATA
============================================================ */
router.put("/me", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ error: "Unauthorized - No Token" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const updates = {};

    if (req.body.phone !== undefined) updates.phone = req.body.phone;
    if (Array.isArray(req.body.addresses)) updates.addresses = req.body.addresses;

    const user = await User.findByIdAndUpdate(decoded.id, updates, {
      new: true,
      runValidators: true,
      select: "-password",
    });

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    return res.status(401).json({ error: "Invalid Token" });
  }
});

module.exports = router;
