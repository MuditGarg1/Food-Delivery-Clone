import couponModel from "../models/couponModel.js";
import shopModel from "../models/shopModel.js";

// POST /api/coupon/create
const createCoupon = async (req, res) => {
    try {
        const { code, discountPercentage, isActive, expiryDate } = req.body;
        const ownerId = req.userId;

        // Check if owner has a shop
        const shop = await shopModel.findOne({ ownerId });
        if (!shop) {
             return res.json({ success: false, message: "You don't have a shop to create coupons for." });
        }

        const newCoupon = new couponModel({
            code: code.toUpperCase(),
            discountPercentage,
            shopId: shop._id,
            isActive: isActive !== undefined ? isActive : true,
            expiryDate
        });

        await newCoupon.save();
        res.json({ success: true, message: "Coupon created successfully." });
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.json({ success: false, message: "Coupon code already exists." });
        }
        res.json({ success: false, message: "Error creating coupon." });
    }
};

// GET /api/coupon/shop/:shopId
const getShopCoupons = async (req, res) => {
    try {
        const { shopId } = req.params;
        const coupons = await couponModel.find({ shopId });
        res.json({ success: true, data: coupons });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error fetching coupons." });
    }
};

// POST /api/coupon/apply
const applyCoupon = async (req, res) => {
    try {
        const { code, shopId } = req.body;
        const coupon = await couponModel.findOne({ code: code.toUpperCase(), shopId, isActive: true });
        
        if (!coupon) {
            return res.json({ success: false, message: "Invalid or expired coupon for this shop." });
        }
        
        if (new Date(coupon.expiryDate) < new Date()) {
             return res.json({ success: false, message: "Coupon has expired." });
        }

        res.json({ success: true, data: coupon });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error applying coupon." });
    }
};

export { createCoupon, getShopCoupons, applyCoupon };
