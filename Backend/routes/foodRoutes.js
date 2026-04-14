import express from "express";
import { addFood, listFood, removeFood, listFoodsByShop, updateFood } from "../controllers/foodController.js";
import authMiddleware from "../middlewares/auth.js";
import multer from "multer";

const foodRouter = express.Router();

// Multer disk storage config — saves uploaded images to /uploads folder
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        // Unique filename: timestamp + original name
        cb(null, `${Date.now()}_${file.originalname}`);
    },
});

const upload = multer({ storage });

foodRouter.post("/add", authMiddleware, upload.single("image"), addFood);
foodRouter.get("/list", listFood);
foodRouter.get("/shop/:shopId", listFoodsByShop);
foodRouter.put("/update", authMiddleware, updateFood);
foodRouter.delete("/remove", authMiddleware, removeFood);

export default foodRouter;