import mongoose from "mongoose";

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
                type: String
            },
            country: {
                type: String
            },
            line1: {
                type: String
            },
            line2: {
                type: String
            },
            postal_code: {
                type: String
            },
            state: {
                type: String
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
