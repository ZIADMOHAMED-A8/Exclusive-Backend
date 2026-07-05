import mongoose from "mongoose";

const paymentSchema = new Schema({
    amount: Number,

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

    transactionId: String,

    gateway: {
        type: String,
        enum: ["stripe", "paymob"]
    }

}, { timestamps: true });
mongoose.model('payment', paymentSchema)