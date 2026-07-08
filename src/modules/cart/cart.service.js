import cartModel from "../../DB/models/cart.model.js"
import AppError from "../../utils/appError.js"
import { decodeAccessToken } from "../../utils/decodeToken.js"
import httpStatusText from "../../utils/httpStatusText.js"

const addItem = async (req, res, next) => {
    const itemId = req.body.id
    const itemQuantity = +(req.body.quantity)
    const { id } = decodeAccessToken(req)
    let cart = await cartModel.findOne({ user: id });
    if (!cart) {
        const cart = new cartModel({
            user: id,
            products: [
                {
                    product: itemId,
                    quantity: itemQuantity
                }
            ]
        })
        await cart.save()
        return res.status(200).json({
            status: httpStatusText.SUCCESS,
            data: {
                cart
            }
        })
    }

    const item = cart.products.find((item) =>
        item.product.toString() === itemId
    )
    console.log(item)
    if (item) {
        item.quantity += itemQuantity
    }
    else {
        cart.products.push({
            product: itemId,
            quantity: itemQuantity
        })
    }
    await cart.save()
    return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            cart
        }
    })

}

const removeItem = async (req, res, next) => {
    const itemId = req.params.id
    const { id } = decodeAccessToken(req)

    const cart = await cartModel.findOne({ user: id })
    console.log(cart)
    const item = cart.products.find((item) =>
        item.product.toString() === itemId)
    item.quantity--;
    await cart.save()
    return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            cart
        }
    })
}

const getCart = async (req, res, next) => {
    const { id } = decodeAccessToken(req)
    console.log(id)
    const cart = await cartModel.findOne({ user: id }).populate('products.product')
    const totalPrice=cart.products.reduce((acc,curr)=>acc+(curr.quantity * curr.product.price),0) ?? 0
    console.log(totalPrice)
    return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            cart : cart ? {
                ...cart.toJSON(),
                totalPrice
            } : []
        }
    })

}

const deleteCart=async (req,res,next)=>{
    const { id } = decodeAccessToken(req)

    await cartModel.findOneAndDelete({user:id})
    res.status(200).json({
        status:httpStatusText.SUCCESS,
        data:null
    })
}
export {
    addItem,
    removeItem,
    getCart,
    deleteCart
}