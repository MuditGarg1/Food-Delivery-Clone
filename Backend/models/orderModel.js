import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    items: {
        type: Array,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    address: {
        type: Object,
        required: true,
    },
    status: {
        type: String,
        default: "Food Processing",
    },
    date: {
        type: Date,
        default: Date.now,
    },
    payment: {
        type: Boolean,
        default: false,
    },
    paymentMethod: {
        type: String,
        enum: ['Stripe', 'COD'],
        default: 'Stripe'
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "shop",
        required: false // Optional to handle legacy items without error
    },
    couponApplied: {
        type: String,
        default: null
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    isRated: {
        type: Boolean,
        default: false
    },
    deliveryPartnerRating: {
        type: Number,
        default: 0
    }
});

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;
