import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    ratingSum: {
        type: Number,
        default: 0
    },
    ratingCount: {
        type: Number,
        default: 0
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],  // [longitude, latitude]
            default: [0, 0]
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

shopSchema.index({ location: '2dsphere' });

const shopModel = mongoose.models.shop || mongoose.model("shop", shopSchema);

export default shopModel;
