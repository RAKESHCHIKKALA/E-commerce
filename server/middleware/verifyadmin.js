const jwt = require("jsonwebtoken");
const User = require("../models/usermodel");

const JWT_SECRET = process.env.SECRET_KEY;

// Middleware to check admin access
async function adminMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token, unauthorized" });
    }

    // Decode token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check admin role
    if (!user.isAdmin) {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }

    req.user = user; // Save user info for next routes
    next();
  } catch (err) {
    console.log("Admin Middleware Error:", err.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = adminMiddleware;
