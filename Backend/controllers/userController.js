import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// Helper: Create JWT token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// POST /api/user/register
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "User already exists with this email." });
        }

        // Validate email
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email." });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters." });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Assign role — 'admin' cannot be self-assigned, must be seeded in DB
        let userRole = 'customer';
        if (role && ['customer', 'shop_owner'].includes(role)) {
            userRole = role;
        }

        // Create and save user
        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            role: userRole,
        });

        const user = await newUser.save();
        const token = createToken(user._id);

        res.json({ success: true, token, role: user.role, message: "Registration successful." });
    } catch (error) {
        console.error("Register error:", error);
        res.json({ success: false, message: "Registration failed. Please try again." });
    }
};

// POST /api/user/login
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "No account found with this email." });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Incorrect password." });
        }

        const token = createToken(user._id);
        res.json({ success: true, token, role: user.role, message: "Login successful." });
    } catch (error) {
        console.error("Login error:", error);
        res.json({ success: false, message: "Login failed. Please try again." });
    }
};

export { registerUser, loginUser };
