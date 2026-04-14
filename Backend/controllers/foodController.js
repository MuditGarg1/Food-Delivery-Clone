import foodModel from "../models/foodModel.js";
import shopModel from "../models/shopModel.js";
import fs from "fs";

// POST /api/food/add  (shop_owner)
const addFood = async (req, res) => {
    try {
        const ownerId = req.userId; // from authMiddleware
        const shop = await shopModel.findOne({ ownerId });
        
        if (!shop || shop.status !== 'approved') {
            return res.json({ success: false, message: "You need an approved shop to add items." });
        }

        const image_filename = req.file ? req.file.filename : "";

        const food = new foodModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            shopId: shop._id,
            image: image_filename,
        });

        await food.save();
        res.json({ success: true, message: "Food Added Successfully." });
    } catch (error) {
        console.error("addFood error:", error);
        res.json({ success: false, message: "Failed to add food." });
    }
};

// GET /api/food/list
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({});
        res.json({ success: true, data: foods });
    } catch (error) {
        console.error("listFood error:", error);
        res.json({ success: false, message: "Failed to fetch food list." });
    }
};

// GET /api/food/shop/:shopId
const listFoodsByShop = async (req, res) => {
    try {
        const foods = await foodModel.find({ shopId: req.params.shopId });
        res.json({ success: true, data: foods });
    } catch (error) {
        console.error("listFoodsByShop error:", error);
        res.json({ success: false, message: "Failed to fetch shop menu." });
    }
};

// DELETE /api/food/remove
const removeFood = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        if (!food) {
            return res.json({ success: false, message: "Food not found." });
        }
        
        // Ensure the owner owns this food's shop
        const ownerShop = await shopModel.findOne({ ownerId: req.userId });
        if (!ownerShop || food.shopId.toString() !== ownerShop._id.toString()) {
            return res.json({ success: false, message: "Unauthorized to delete this item." });
        }

        // Delete image from uploads folder
        const imagePath = `uploads/${food.image}`;
        if (fs.existsSync(imagePath)) {
            fs.unlink(imagePath, (err) => {
                if (err) console.error("Image delete error:", err);
            });
        }

        await foodModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Food Removed Successfully." });
    } catch (error) {
        console.error("removeFood error:", error);
        res.json({ success: false, message: "Failed to remove food." });
    }
};

// PUT /api/food/update
const updateFood = async (req, res) => {
    try {
        const { id, price, isAvailable } = req.body;
        const food = await foodModel.findById(id);
        
        if (!food) {
            return res.json({ success: false, message: "Food not found." });
        }
        
        // Ensure the owner owns this food's shop
        const ownerShop = await shopModel.findOne({ ownerId: req.userId });
        if (!ownerShop || food.shopId.toString() !== ownerShop._id.toString()) {
            return res.json({ success: false, message: "Unauthorized to update this item." });
        }

        if (price !== undefined) food.price = Number(price);
        if (isAvailable !== undefined) food.isAvailable = isAvailable === true || isAvailable === 'true';

        await food.save();
        res.json({ success: true, message: "Food updated successfully." });
    } catch (error) {
        console.error("updateFood error:", error);
        res.json({ success: false, message: "Failed to update food." });
    }
};

export { addFood, listFood, listFoodsByShop, removeFood, updateFood };