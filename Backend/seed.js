import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import models
import userModel from './models/userModel.js';
import shopModel from './models/shopModel.js';
import foodModel from './models/foodModel.js';

const MONGO_URI = 'mongodb://127.0.0.1:27017/food-del';

// Raw data to seed
const food_list_raw = [
    { name: "Greek salad", image: "food_1.png", price: 12, description: "Food provides essential nutrients for overall health and well-being", category: "Salad" },
    { name: "Veg salad", image: "food_2.png", price: 18, description: "Food provides essential nutrients for overall health and well-being", category: "Salad" },
    { name: "Clover Salad", image: "food_3.png", price: 16, description: "Food provides essential nutrients for overall health and well-being", category: "Salad" },
    { name: "Chicken Salad", image: "food_4.png", price: 24, description: "Food provides essential nutrients for overall health and well-being", category: "Salad" },
    { name: "Lasagna Rolls", image: "food_5.png", price: 14, description: "Food provides essential nutrients for overall health and well-being", category: "Rolls" },
    { name: "Peri Peri Rolls", image: "food_6.png", price: 12, description: "Food provides essential nutrients for overall health and well-being", category: "Rolls" },
    { name: "Chicken Rolls", image: "food_7.png", price: 20, description: "Food provides essential nutrients for overall health and well-being", category: "Rolls" },
    { name: "Veg Rolls", image: "food_8.png", price: 15, description: "Food provides essential nutrients for overall health and well-being", category: "Rolls" },
    { name: "Ripple Ice Cream", image: "food_9.png", price: 14, description: "Food provides essential nutrients for overall health and well-being", category: "Deserts" },
    { name: "Fruit Ice Cream", image: "food_10.png", price: 22, description: "Food provides essential nutrients for overall health and well-being", category: "Deserts" },
    { name: "Jar Ice Cream", image: "food_11.png", price: 10, description: "Food provides essential nutrients for overall health and well-being", category: "Deserts" },
    { name: "Vanilla Ice Cream", image: "food_12.png", price: 12, description: "Food provides essential nutrients for overall health and well-being", category: "Deserts" },
    { name: "Chicken Sandwich", image: "food_13.png", price: 12, description: "Food provides essential nutrients for overall health and well-being", category: "Sandwich" },
    { name: "Vegan Sandwich", image: "food_14.png", price: 18, description: "Food provides essential nutrients for overall health and well-being", category: "Sandwich" },
    { name: "Grilled Sandwich", image: "food_15.png", price: 16, description: "Food provides essential nutrients for overall health and well-being", category: "Sandwich" },
    { name: "Bread Sandwich", image: "food_16.png", price: 24, description: "Food provides essential nutrients for overall health and well-being", category: "Sandwich" },
    { name: "Cup Cake", image: "food_17.png", price: 14, description: "Food provides essential nutrients for overall health and well-being", category: "Cake" },
    { name: "Vegan Cake", image: "food_18.png", price: 12, description: "Food provides essential nutrients for overall health and well-being", category: "Cake" },
    { name: "Butterscotch Cake", image: "food_19.png", price: 20, description: "Food provides essential nutrients for overall health and well-being", category: "Cake" },
    { name: "Sliced Cake", image: "food_20.png", price: 15, description: "Food provides essential nutrients for overall health and well-being", category: "Cake" },
    { name: "Garlic Mushroom", image: "food_21.png", price: 14, description: "Food provides essential nutrients for overall health and well-being", category: "Pure Veg" },
    { name: "Fried Cauliflower", image: "food_22.png", price: 22, description: "Food provides essential nutrients for overall health and well-being", category: "Pure Veg" },
    { name: "Mix Veg Pulao", image: "food_23.png", price: 10, description: "Food provides essential nutrients for overall health and well-being", category: "Pure Veg" },
    { name: "Rice Zucchini", image: "food_24.png", price: 12, description: "Food provides essential nutrients for overall health and well-being", category: "Pure Veg" },
    { name: "Cheese Pasta", image: "food_25.png", price: 12, description: "Food provides essential nutrients for overall health and well-being", category: "Pasta" },
    { name: "Tomato Pasta", image: "food_26.png", price: 18, description: "Food provides essential nutrients for overall health and well-being", category: "Pasta" },
    { name: "Creamy Pasta", image: "food_27.png", price: 16, description: "Food provides essential nutrients for overall health and well-being", category: "Pasta" },
    { name: "Chicken Pasta", image: "food_28.png", price: 24, description: "Food provides essential nutrients for overall health and well-being", category: "Pasta" },
    { name: "Buttter Noodles", image: "food_29.png", price: 14, description: "Food provides essential nutrients for overall health and well-being", category: "Noodles" },
    { name: "Veg Noodles", image: "food_30.png", price: 12, description: "Food provides essential nutrients for overall health and well-being", category: "Noodles" },
    { name: "Somen Noodles", image: "food_31.png", price: 20, description: "Food provides essential nutrients for overall health and well-being", category: "Noodles" },
    { name: "Cooked Noodles", image: "food_32.png", price: 15, description: "Food provides essential nutrients for overall health and well-being", category: "Noodles" }
];

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        // 1. Ensure a dummy shop owner user exists
        let owner = await userModel.findOne({ email: "owner@seed.com" });
        if (!owner) {
            owner = new userModel({
                name: "Seed Owner",
                email: "owner@seed.com",
                password: "hashedpassword123", // Doesn't matter, we won't log in
                role: "shop_owner"
            });
            await owner.save();
            console.log("Created dummy owner user");
        }

        // 2. Clear out older mock shops?
        // Let's not clear them, just add new ones if we want to be safe, but clearing is cleaner.
        // Wait, if we clear them, all their items are orphaned.
        // Better to just delete all foods generated by seed, but we can't easily track.
        // Let's just create 3 new shops to hold different categories of the assets data.

        const shop1 = new shopModel({
            name: "Tomato Restaurant", ownerId: owner._id, description: "Authentic multi-cuisine.", address: "NYC", image: "header_img.png", status: "approved"
        });
        const shop2 = new shopModel({
            name: "Desserts Oasis", ownerId: owner._id, description: "Sweets and cakes.", address: "NYC", image: "menu_3.png", status: "approved"
        });
        const shop3 = new shopModel({
            name: "The Healthy Bowl", ownerId: owner._id, description: "Salads and pure veg.", address: "NYC", image: "menu_1.png", status: "approved"
        });

        await shop1.save(); await shop2.save(); await shop3.save();
        console.log("Created 3 Mock Shops");

        // 3. Loop through raw resources and assign them to shops based on category
        // Copy static images to backend uploads
        const frontendAssetsDir = path.join(__dirname, '../Frontend/src/assets');
        const backendUploadsDir = path.join(__dirname, 'uploads');
        
        for (let foodItem of food_list_raw) {
            // Find which shop to map to
            let targetShop = shop1._id;
            if (['Deserts', 'Cake'].includes(foodItem.category)) {
                targetShop = shop2._id;
            } else if (['Salad', 'Pure Veg'].includes(foodItem.category)) {
                targetShop = shop3._id;
            }

            // Copy File
            let sourceFile = path.join(frontendAssetsDir, foodItem.image);
            let targetFileName = `${Date.now()}_${foodItem.image}`; // Append timestamp to match multer behavior visually
            let targetFile = path.join(backendUploadsDir, targetFileName);

            if (fs.existsSync(sourceFile)) {
                fs.copyFileSync(sourceFile, targetFile);
            }

            // Create DB Record
            const newFood = new foodModel({
                name: foodItem.name,
                description: foodItem.description,
                price: foodItem.price * 80, // Multiplying by 80 for realistic INR conversion
                image: targetFileName,
                category: foodItem.category,
                shopId: targetShop
            });
            await newFood.save();
        }
        
        // Also copy standard files
        const stdImgs = ["header_img.png", "menu_3.png", "menu_1.png"];
        for (let img of stdImgs) {
            let src = path.join(frontendAssetsDir, img);
            let dest = path.join(backendUploadsDir, img); // No prefix to match shop object creation above
            if (fs.existsSync(src)) fs.copyFileSync(src, dest);
        }

        console.log("Seeding complete! 32 items added.");
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

seedDB();
