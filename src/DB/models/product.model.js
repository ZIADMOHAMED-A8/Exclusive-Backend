import mongoose from "mongoose";

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true

    },
    thumbnail: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true

    },
    stock: {
        type: Number,
        required: true,

    },
    seller:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    averageRating:{
        type:Number,
        default:0,
    },
    reviewsCount:{
        type:Number,
        default:0,
    }

})

mongoose.model('product',productSchema)