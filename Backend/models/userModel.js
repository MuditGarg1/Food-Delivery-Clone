import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    cartData: {
        type: Object,
        default: {},
    },
    role: {
        type: String,
        enum: ['customer', 'shop_owner', 'admin'],
        default: 'customer'
    }
}, { minimize: false });  // minimize:false keeps empty objects in DB

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
