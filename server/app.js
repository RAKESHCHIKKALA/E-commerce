const express=require('express');


require("dotenv").config();

const PORT = process.env.PORT;
const cors=require("cors");
const connectDB=require("./config/db");
const adminRoutes = require("./routes/admin");
const cartRoutes = require("./routes/cartRoutes");
const app=express();
connectDB();
app.use(cors());
app.use(express.json());
console.log("Cloudinary cloud:", process.env.CLOUD_NAME);
app.use('/uploads', express.static('uploads'));

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/cart", cartRoutes);

app.use("/api-+/admin", adminRoutes);


app.listen(PORT,()=>{
    console.log("server started at 1234");
})


