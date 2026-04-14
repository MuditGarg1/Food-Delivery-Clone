import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import userModel from "./models/userModel.js";

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash("admin123", salt);
        
        // Check if admin already exists
        let admin = await userModel.findOne({ email: "admin@del.com" });
        if (!admin) {
            admin = new userModel({
                name: "Admin User",
                email: "admin@del.com",
                password: password,
                role: "admin"
            });
            await admin.save();
            console.log("Admin created successfully! Email: admin@del.com | Password: admin123");
        } else {
            // Update the existing admin to ensure password is correct and role is admin
            admin.password = password;
            admin.role = "admin";
            await admin.save();
            console.log("Admin updated successfully! Email: admin@del.com | Password: admin123");
        }
        process.exit();
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
run();
