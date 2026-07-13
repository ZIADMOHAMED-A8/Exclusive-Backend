import mongoose from "mongoose";

const checkoutSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cart",
        required: true
    },
    stripeSessionId: {
        type: String,
        unique: true,
        sparse: true
    },
    items: [
        {
            _id: false,
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "product",
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            }
        }
    ],
    status: {
        type: String,
        enum: ["reserved", "paid", "released"],
        default: "reserved"
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    paidAt: Date,
    releasedAt: Date
}, {
    timestamps: true
});

checkoutSessionSchema.index({ status: 1, expiresAt: 1 });

export default mongoose.model("checkoutSession", checkoutSessionSchema);
