import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
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
        trim: true,
        minLength:10

    },
    stock: {
        type: Number,
        required: true,
        min:0

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
    totalStars:{
        type:Number,
        default:0,
    },
    reviewsCount:{
        type:Number,
        default:0,
    }

})

export default mongoose.model('product',productSchema)
