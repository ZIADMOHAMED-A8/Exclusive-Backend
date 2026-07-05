import mongoose, { mongo } from "mongoose";
import { required } from "zod/mini";

const orderSchema = mongoose.Schema(
    {

        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "product",
                    required: true
                },
                name: {
                    type: String,
                    required: true
                },
                thumbnail: {
                    type: String,
                    required: true
                },
                price: {
                    type: Number,
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ],
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        }
        ,
        payment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'payment',
            required: true
        },
        delieveryDate: {
            type: Date,
            required: true
        },
        shippingAddress: {
            type: String,
            required: true
        },
        totalPrice: {
            type: Number,
            required: true
        },
        orderStatus: {
            type: String,
            enum: [
                "processing",
                "shipped",
                "delivered",
                "cancelled"
            ],
            default: "processing"
        }

    }
    , {
        timestamps: true
    })

mongoose.model('order', orderSchema)