import express from "express";
import { createShop, getApprovedShops, getAllShops, updateShopStatus, getOwnerShop, deleteShop } from "../controllers/shopController.js";
import authMiddleware from "../middlewares/auth.js";
import multer from "multer";

const shopRouter = express.Router();

// Setup Multer for Image Storage
const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

shopRouter.post("/create", authMiddleware, upload.single("image"), createShop);
shopRouter.get("/list", getApprovedShops);
shopRouter.get("/owner", authMiddleware, getOwnerShop);
shopRouter.post("/remove", authMiddleware, deleteShop);

// Admin routes
shopRouter.get("/admin/list", authMiddleware, getAllShops);
shopRouter.post("/admin/status", authMiddleware, updateShopStatus);

export default shopRouter;
