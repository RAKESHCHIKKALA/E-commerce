import express from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";
import adminRoutes from "./routes/admin.js";
import cartRoutes from "./routes/cartRoutes.js";

dotenv.config();

const PORT = process.env.PORT || 1234;
const app = express();

connectDB();

app.use(cors());
app.use(express.json());

console.log("Cloudinary cloud:", process.env.CLOUD_NAME);

app.use("/uploads", express.static("uploads"));

app.use("/api/users", (await import("./routes/userRoutes.js")).default);
app.use("/api/products", (await import("./routes/productRoutes.js")).default);
app.use("/api/orders", (await import("./routes/orderRoutes.js")).default);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminRoutes);

/* ⚠️ REMOVE dist serving (you DON'T have dist here) */
// ❌ app.use(express.static(path.join(__dirname, "dist")));
// ❌ app.get("*", ...)

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
