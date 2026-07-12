import reviewModel from "../../DB/models/reviews.model.js"
import productModel from "../../DB/models/product.model.js"
import AppError from "../../utils/appError.js"
import httpStatusText from "../../utils/httpStatusText.js"

const updateProductRating = async (productId, starsDiff, countDiff) => {
    return productModel.findByIdAndUpdate(
        productId,
        [
            {
                $set: {
                    totalStars: {
                        $max: [
                            0,
                            { $add: [{ $ifNull: ["$totalStars", 0] }, starsDiff] }
                        ]
                    },
                    reviewsCount: {
                        $max: [
                            0,
                            { $add: [{ $ifNull: ["$reviewsCount", 0] }, countDiff] }
                        ]
                    }
                }
            },
            {
                $set: {
                    averageRating: {
                        $cond: [
                            { $eq: ["$reviewsCount", 0] },
                            0,
                            { $divide: ["$totalStars", "$reviewsCount"] }
                        ]
                    }
                }
            }
        ],
        { new: true, updatePipeline: true } // 👈 دي الإضافة
    );
};

const addReview = async (req, res, next) => {
    const { id: user } = req.user
    const { id } = req.params
    const { stars, review } = req.body
    const numericStars = Number(stars)
    const product = await productModel.findById(id)
    if (!product) {
        return next(new AppError('product not found', 404))
    }

    const existingReview = await reviewModel.findOne({ user, product: id })
    if (existingReview) {
        return next(new AppError('you already reviewed this product', 409))
    }

    const newReview = new reviewModel({
        stars: numericStars,
        review,
        user,
        product: id
    })
    await newReview.save()
    console.log(numericStars)
    await updateProductRating(id, numericStars, 1)
    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            newReview
        }
    })
}

const getProductReviews = async (req, res) => {
    const { id } = req.params
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    const product = await productModel.findById(id)
    if (!product) {
        throw new AppError('product not found', 404)
    }

    const reviews = await reviewModel
        .find({ product: id })
        .populate('user', 'name email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            reviews
        }
    })
}

const editReview = async (req, res, next) => {
    const { id: user } = req.user
    const { id } = req.params

    const review = await reviewModel.findOne({ _id: id, user })
    if (!review) {
        return next(new AppError('review not found', 404))
    }

    const oldStars = review.stars
    if (req.body.stars !== undefined) {
        review.stars = req.body.stars
    }
    if (req.body.review !== undefined) {
        review.review = req.body.review
    }

    await review.save()

    const starsDiff = review.stars - oldStars
    if (starsDiff !== 0) {
        await updateProductRating(review.product, starsDiff, 0)
    }

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            review
        }
    })
}

const deleteReview = async (req, res, next) => {
    const { id: user } = req.user
    const { id } = req.params

    const review = await reviewModel.findOneAndDelete({ _id: id, user })
    if (!review) {
        return next(new AppError('review not found', 404))
    }

    await updateProductRating(review.product, -review.stars, -1)

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            review
        }
    })
}


export {
    addReview,
    getProductReviews,
    editReview,
    deleteReview
}
