import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import shopModel from "../models/shopModel.js";
import foodModel from "../models/foodModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Delivery fee added to every order
const DELIVERY_FEE = 2;

// POST /api/order/place  (user must be logged in)
const placeOrder = async (req, res) => {
    const frontend_url = process.env.FRONTEND_URL || "http://localhost:5173";

    try {
        // 1. Save the new order
        const newOrder = new orderModel({
            userId: req.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            shopId: req.body.shopId || null,
            couponApplied: req.body.couponApplied || null,
            discountAmount: req.body.discountAmount || 0,
            paymentMethod: req.body.paymentMethod || 'Stripe'
        });
        await newOrder.save();

        // 2. Clear user's cart after placing order
        await userModel.findByIdAndUpdate(req.userId, { cartData: {} });

        if (req.body.paymentMethod === 'COD') {
             return res.json({ success: true, cod_success: true, orderId: newOrder._id });
        }

        // 3. Build Stripe line items from cart items
        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: "inr",         // Change to "usd" or your currency
                product_data: { name: item.name },
                unit_amount: item.price * 100,  // Stripe expects paise/cents
            },
            quantity: item.quantity,
        }));

        // 4. Add delivery fee as a line item
        line_items.push({
            price_data: {
                currency: "inr",
                product_data: { name: "Delivery Charges" },
                unit_amount: DELIVERY_FEE * 100,
            },
            quantity: 1,
        });

        // 5. Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
        });

        res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.error("placeOrder error:", error);
        res.json({ success: false, message: "Failed to place order." });
    }
};

// POST /api/order/verify  (called after Stripe redirect)
const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;

    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Payment successful. Order confirmed." });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Payment cancelled. Order removed." });
        }
    } catch (error) {
        console.error("verifyOrder error:", error);
        res.json({ success: false, message: "Order verification failed." });
    }
};

// POST /api/order/userorders  (user's own orders)
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.userId });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error("userOrders error:", error);
        res.json({ success: false, message: "Failed to fetch your orders." });
    }
};

// GET /api/order/list  (admin: all orders)
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error("listOrders error:", error);
        res.json({ success: false, message: "Failed to fetch orders." });
    }
};

// POST /api/order/status  (admin: update order status)
const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, {
            status: req.body.status,
        });
        res.json({ success: true, message: "Order status updated." });
    } catch (error) {
        console.error("updateStatus error:", error);
        res.json({ success: false, message: "Failed to update status." });
    }
};

// POST /api/order/rate
const rateOrder = async (req, res) => {
    try {
        const { orderId, shopRating, deliveryPartnerRating, foodRatings } = req.body;
        
        const order = await orderModel.findById(orderId);
        if(!order) return res.json({success:false, message: "Order not found"});
        if(order.isRated) return res.json({success:false, message: "Order already rated"});

        if (order.shopId && shopRating) {
            await shopModel.findByIdAndUpdate(order.shopId, {
                $inc: { ratingSum: Number(shopRating), ratingCount: 1 }
            });
        }
        
        if (foodRatings && foodRatings.length > 0) {
            for (let f of foodRatings) {
                if (f.id && f.rating) {
                    await foodModel.findByIdAndUpdate(f.id, {
                        $inc: { ratingSum: Number(f.rating), ratingCount: 1 }
                    });
                }
            }
        }

        order.isRated = true;
        if (deliveryPartnerRating) order.deliveryPartnerRating = Number(deliveryPartnerRating);
        await order.save();
        
        res.json({success: true, message: "Thank you for your feedback!"});
    } catch(err) {
        console.error("rateOrder error:", err);
        res.json({success: false, message: "Error rating order"});
    }
}

// GET /api/order/shoporders
const shopOrders = async (req, res) => {
    try {
        const userId = req.userId;
        const shop = await shopModel.findOne({ ownerId: userId });
        if (!shop) {
             return res.json({ success: false, message: "Shop not found." });
        }
        
        const orders = await orderModel.find({ shopId: shop._id }).sort({ date: -1 });
        res.json({ success: true, data: orders });
    } catch(err) {
        console.error("shopOrders error:", err);
        res.json({ success: false, message: "Error fetching shop orders" });
    }
}

// POST /api/order/cancel  (user must be logged in)
const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await orderModel.findById(orderId);

        if (!order) return res.status(404).json({ success: false, message: "Order not found." });
        if (order.userId.toString() !== req.userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorised to cancel this order." });
        }
        if (order.status !== "Food Processing") {
            return res.status(400).json({ success: false, message: "Order can only be cancelled before it starts Preparing." });
        }

        await orderModel.findByIdAndUpdate(orderId, { status: "Cancelled" });
        res.json({ success: true, message: "Order cancelled successfully." });
    } catch (error) {
        console.error("cancelOrder error:", error);
        res.status(500).json({ success: false, message: "Failed to cancel order." });
    }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus, rateOrder, shopOrders, cancelOrder };
