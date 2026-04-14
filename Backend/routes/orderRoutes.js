import express from "express";
import {
    placeOrder,
    verifyOrder,
    userOrders,
    listOrders,
    updateStatus,
    rateOrder,
    shopOrders,
    cancelOrder
} from "../controllers/orderController.js";
import authMiddleware from "../middlewares/auth.js";

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.get("/list", authMiddleware, listOrders);          // admin only
orderRouter.post("/status", authMiddleware, updateStatus);     // admin/owner update order status
orderRouter.post("/rate", authMiddleware, rateOrder);
orderRouter.get("/shoporders", authMiddleware, shopOrders);
orderRouter.post("/cancel", authMiddleware, cancelOrder);

export default orderRouter;
