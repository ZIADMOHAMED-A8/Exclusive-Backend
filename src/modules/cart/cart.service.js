import cartModel from "../../DB/models/cart.model.js"
import orderModel from "../../DB/models/order.model.js"
import paymentModel from "../../DB/models/payment.model.js"
import AppError from "../../utils/appError.js"
import { decodeAccessToken } from "../../utils/decodeToken.js"
import httpStatusText from "../../utils/httpStatusText.js"
import stripe from "../../utils/stripe.js"

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
    const item = cart?.products?.find((item) =>
        item.product.toString() === itemId)
    if (!item) {
        const error = new AppError("product not found in user's cart")
        return next(error)
    }
    item.quantity--;
    if (item.quantity <= 0) {
        cart.products.pull({ product: itemId });
    }
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
    const totalPrice = cart?.products?.reduce((acc, curr) => acc + (curr.quantity * curr.product.price), 0) ?? 0
    console.log(totalPrice)
    return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            cart: cart ? {
                ...cart.toJSON(),
                totalPrice
            } : []
        }
    })

}

const deleteCart = async (req, res, next) => {
    const { id } = decodeAccessToken(req)

    await cartModel.findOneAndDelete({ user: id })
    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: null
    })
}

const createCheckoutSession = async (req, res, next) => {
    const { id } = decodeAccessToken(req)
    const cart = await cartModel.findOne({ user: id }).populate('products.product')
    if (!cart || cart.products.length === 0) {
        return next(new AppError("cart is empty", 400))
    }
    const line_items = cart.products.map((item) => ({
        price_data: {
            currency: "usd",
            product_data: {
                name: item.product.name,
                images: [item.product.thumbnail],
            },
            unit_amount: Math.round(item.product.price * 100),
        },
        quantity: item.quantity,
    }));
    const sessionPayload = {
        line_items,

        mode: "payment",

        shipping_address_collection: {
            allowed_countries: ["US", "EG"]
        },

        metadata: {
            userId: id,
            cartId: cart._id.toString()
        },

        success_url: "https://www.youtube.com/watch?v=3OOHC_UzrKA",
        cancel_url: "https://www.youtube.com/watch?v=3OOHC_UzrKA"
    }

    if (req.body.email) {
        sessionPayload.customer_email = req.body.email
    }

    const session = await stripe.checkout.sessions.create(sessionPayload)
    res.status(200).json(session)
}

const createOrderFromPaidSession = async (session) => {
    let payment = await paymentModel.findOne({ transactionId: session.payment_intent })
    if (payment) {
        const existingOrder = await orderModel.findOne({ payment: payment._id })
        if (existingOrder) {
            return
        }
    }

    const cart = await cartModel.findById(session.metadata.cartId).populate('products.product')
    if (!cart || cart.products.length === 0) {
        throw new AppError("cart not found or empty", 404)
    }

    const items = cart.products.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        thumbnail: item.product.thumbnail,
        price: item.product.price,
        quantity: item.quantity
    }))

    const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
    if (!payment) {
        payment = await paymentModel.create({
            amount: (session.amount_total ?? Math.round(totalPrice * 100)) / 100,
            status: "paid",
            transactionId: session.payment_intent,
            gateway: "stripe"
        })
    }

    const existingOrder = await orderModel.findOne({ payment: payment._id })
    if (existingOrder) {
        return
    }

    const shippingAddress = session.shipping_details?.address
        ? [
            session.shipping_details.address.line1,
            session.shipping_details.address.line2,
            session.shipping_details.address.city,
            session.shipping_details.address.state,
            session.shipping_details.address.country,
            session.shipping_details.address.postal_code
        ].filter(Boolean).join(", ")
        : "Not provided"

    await orderModel.create({
        items,
        user: session.metadata.userId,
        payment: payment._id,
        delieveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        shippingAddress,
        totalPrice,
        orderStatus: "processing"
    })

    await cartModel.findByIdAndDelete(cart._id)
}

const stripeWebhook = async (req, res, next) => {
    console.log('detected')
    let event

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            req.headers["stripe-signature"],
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    try {
        if (event.type === "checkout.session.completed") {
            const session = event.data.object
            if (session.payment_status === "paid") {
                await createOrderFromPaidSession(session)
            }
        }

        res.status(200).json({ received: true })
    } catch (err) {
        next(err)
    }
}

export {
    addItem,
    removeItem,
    getCart,
    deleteCart,
    createCheckoutSession,
    stripeWebhook
}
