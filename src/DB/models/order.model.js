import mongoose from "mongoose";
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
            required: true,
            unique:true
        },
        delieveryDate: {
            type: Date,
            required: true
        },
        shippingAddress: {
            city: {
                type: String,
                required: true
            },
            country: {
                type: String,
                required: true
            },
            line1: {
                type: String,
                required: true
            },
            line2: {
                type: String,
                required: true
            },
            postal_code: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
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
export default mongoose.model('order', orderSchema)
