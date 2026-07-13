import productModel from "../../DB/models/product.model.js"
import reviewsModel from "../../DB/models/reviews.model.js"
import AppError from "../../utils/appError.js"
import { decodeAccessToken } from "../../utils/decodeToken.js"
import httpStatusText from "../../utils/httpStatusText.js"

const addProduct = async (req, res, next) => {
    const data = req.body
    const { id } = decodeAccessToken(req)
    const newProduct = new productModel(
        {
            ...data,
            seller: id
        }
    )
    await newProduct.save()
    res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: {
            product: {
                ...newProduct.toJSON(),
                seller: id
            },

        }
    })
}

const editProduct = async (req, res, next) => {
    const data = req.body
    const existingProduct = await productModel.findOne({ _id: req.params.id })
    if (!existingProduct) {
        const error = new AppError('Product not found', 404)
        next(error)
    }
    const updatedProduct = await productModel.findByIdAndUpdate(req.params.id, data, { returnDocument: 'after' })
    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            product: {
                ...updatedProduct.toJSON()
            }
        }
    })
}


const getProducts = async (req, res, next) => {
    const page = req.query.page
    const limit = req.query.limit
    const skip = (page - 1) * limit
    const products = await productModel.find({}).skip(skip).limit(limit)
    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            products
        }
    })
}

const getSingleProduct = async (req, res, next) => {
    const id = req.params.id
    const product = await productModel.findOne({ _id: id })
    const productReviews = await reviewsModel.find({ product: id })
    if (!product) {
        const error = new AppError('product not found')
        next(error)
    }
    res.status(200).json({  
        status: httpStatusText.SUCCESS,
        data: {
            ...product.toJSON(),
            reviews: productReviews


        }
    })
}

const deleteProduct = async (req, res, next) => {
    const id = req.params.id
    const product = await productModel.findOneAndDelete({ _id: id })

    if (!product) {
        const error = new AppError('product not found')
        next(error)
    }
    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            product
        }
    })
}

const getProductsBySeller = async (req, res, next) => {
    const page = req.query.page
    const limit = req.query.limit
    const skip = (page - 1) * limit
    const { id } = req.params
    const products = await productModel.find({ seller: id }).skip(skip).limit(limit)
    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: products
    })
}
export {
    addProduct,
    editProduct,
    getProducts,
    getSingleProduct,
    deleteProduct,
    getProductsBySeller
}
