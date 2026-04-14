import express from "express";
import { createCoupon, getShopCoupons, applyCoupon } from "../controllers/couponController.js";
import authMiddleware from "../middlewares/auth.js";

const couponRouter = express.Router();

couponRouter.post("/create", authMiddleware, createCoupon);
couponRouter.get("/shop/:shopId", getShopCoupons);
couponRouter.post("/apply", applyCoupon);

export default couponRouter;
