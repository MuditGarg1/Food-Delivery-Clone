import userModel from "../models/userModel.js";

// POST /api/cart/add
const addToCart = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId);
        const cartData = user.cartData;

        if (!cartData[req.body.itemId]) {
            cartData[req.body.itemId] = 1;
        } else {
            cartData[req.body.itemId] += 1;
        }

        await userModel.findByIdAndUpdate(req.userId, { cartData });
        res.json({ success: true, message: "Item added to cart." });
    } catch (error) {
        console.error("addToCart error:", error);
        res.json({ success: false, message: "Failed to add item to cart." });
    }
};

// POST /api/cart/remove
const removeFromCart = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId);
        const cartData = user.cartData;

        if (cartData[req.body.itemId] > 0) {
            cartData[req.body.itemId] -= 1;
            if (cartData[req.body.itemId] === 0) {
                delete cartData[req.body.itemId];
            }
        }

        await userModel.findByIdAndUpdate(req.userId, { cartData });
        res.json({ success: true, message: "Item removed from cart." });
    } catch (error) {
        console.error("removeFromCart error:", error);
        res.json({ success: false, message: "Failed to remove item from cart." });
    }
};

// POST /api/cart/get
const getCart = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId);
        res.json({ success: true, cartData: user.cartData });
    } catch (error) {
        console.error("getCart error:", error);
        res.json({ success: false, message: "Failed to get cart." });
    }
};

export { addToCart, removeFromCart, getCart };
