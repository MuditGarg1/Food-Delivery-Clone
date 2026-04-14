import shopModel from "../models/shopModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";

// POST /api/shop/create
const createShop = async (req, res) => {
    try {
        const { name, description, address, latitude, longitude } = req.body;
        const ownerId = req.userId; // injected by authMiddleware
        
        // Ensure user is shop_owner
        const user = await userModel.findById(ownerId);
        if (!user || user.role !== 'shop_owner') {
            return res.json({ success: false, message: "Only shop owners can create a shop." });
        }

        const image_filename = req.file ? req.file.filename : "";

        // Check if owner already has a shop
        const existingShop = await shopModel.findOne({ ownerId });
        if (existingShop) {
             return res.json({ success: false, message: "You already have a shop registered." });
        }

        const newShop = new shopModel({
            name,
            description,
            address,
            image: image_filename,
            ownerId,
            status: 'pending', // Admin needs to approve
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude) || 0, parseFloat(latitude) || 0]
            }
        });

        await newShop.save();
        res.json({ success: true, message: "Shop created and pending approval." });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error creating shop." });
    }
};

// GET /api/shop/list
const getApprovedShops = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        
        if (lat && lng) {
            const shops = await shopModel.find({
                status: 'approved',
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [parseFloat(lng), parseFloat(lat)]
                        },
                        $maxDistance: 10000 // 10 km limit mathematically mapped natively
                    }
                }
            });
            return res.json({ success: true, data: shops });
        }

        // If User hasn't granted location, fetch all approved shops globally
        const shops = await shopModel.find({ status: 'approved' });
        res.json({ success: true, data: shops });
    } catch (error) {
        console.error("Geo fetch error:", error);
        res.json({ success: false, message: "Error fetching mapped shops." });
    }
};

// GET /api/shop/admin/list
const getAllShops = async (req, res) => {
    try {
         // Verify admin
         const user = await userModel.findById(req.userId);
         if (!user || user.role !== 'admin') {
             return res.json({ success: false, message: "Unauthorized." });
         }
         const shops = await shopModel.find({});
         res.json({ success: true, data: shops });
    } catch (error) {
         console.error(error);
         res.json({ success: false, message: "Error fetching all shops." });
    }
}

// POST /api/shop/admin/status
const updateShopStatus = async (req, res) => {
    try {
        const { shopId, status } = req.body; // status: 'approved' | 'rejected'
        const user = await userModel.findById(req.userId);
        if (!user || user.role !== 'admin') {
             return res.json({ success: false, message: "Unauthorized." });
        }
        await shopModel.findByIdAndUpdate(shopId, { status });
        res.json({ success: true, message: "Shop status updated to " + status });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error updating shop status." });
    }
}

// GET /api/shop/owner
const getOwnerShop = async (req, res) => {
    try {
        const ownerId = req.userId;
        const shop = await shopModel.findOne({ ownerId });
        if (!shop) {
             return res.json({ success: false, message: "Shop not found for this owner." });
        }
        res.json({ success: true, data: shop });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error fetching owner shop." });
    }
}

// POST /api/shop/remove
const deleteShop = async (req, res) => {
    try {
        const { shopId } = req.body;
        const userId = req.userId;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found." });
        }

        const shop = await shopModel.findById(shopId);
        if (!shop) {
            return res.json({ success: false, message: "Shop not found." });
        }

        // Authorization check
        if (user.role !== 'admin') {
            if (user.role !== 'shop_owner' || shop.ownerId.toString() !== userId.toString()) {
                return res.json({ success: false, message: "Unauthorized to delete this shop." });
            }
        }

        // Delete associated food items first
        await foodModel.deleteMany({ shopId });
        
        await shopModel.findByIdAndDelete(shopId);
        res.json({ success: true, message: "Shop deleted successfully." });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error deleting shop." });
    }
}

export { createShop, getApprovedShops, getAllShops, updateShopStatus, getOwnerShop, deleteShop };

