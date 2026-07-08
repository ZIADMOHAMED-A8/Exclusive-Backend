import mongoose from "mongoose";
const reviewsSchema = new mongoose.Schema({
    stars: {
        type: Number,
        min: 1,
        max: 5,
        required: true

    },
    review: {
        type: String,
        minlength: 3,
        trim:true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'user',
        uni
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'product'
    }
},{
    timestamps:true
})
reviewsSchema.index(
    { user: 1, product: 1 },
    { unique: true }
);