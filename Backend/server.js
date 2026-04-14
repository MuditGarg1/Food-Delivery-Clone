import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDb } from "./config/db.js";

// Route imports
import userRouter from "./routes/userRoutes.js";
import foodRouter from "./routes/foodRoutes.js";
import cartRouter from "./routes/cartRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import shopRouter from "./routes/shopRoutes.js";
import couponRouter from "./routes/couponRoutes.js";

// App config
const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));

// Serve uploaded images as static files
app.use("/images", express.static("uploads"));

// DB connection
connectDb();

// API Routes
app.use("/api/user", userRouter);
app.use("/api/food", foodRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/shop", shopRouter);
app.use("/api/coupon", couponRouter);

// Health check
app.get("/", (req, res) => {
    res.send("Food Delivery API is running ✅");
});

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});