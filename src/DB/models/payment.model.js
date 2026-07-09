import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },

    method: {
        type: String,
        enum: ["card"],
        default: "card"
    },

    status: {
        type: String,
        enum: [
            "pending",
            "paid",
            "failed",
            "refunded"
        ],
        default: "pending"
    },

    transactionId: {
        type: String,
        required: true,
        unique: true
    },

    gateway: {
        type: String,
        enum: ["stripe", "paymob"],
        required: true
    }

}, { timestamps: true });

export default mongoose.model('payment', paymentSchema)
