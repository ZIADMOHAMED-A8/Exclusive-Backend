import mongoose from "mongoose"
import cartModel from "../../DB/models/cart.model.js"
import checkoutSessionModel from "../../DB/models/checkoutSession.model.js"
import orderModel from "../../DB/models/order.model.js"
import paymentModel from "../../DB/models/payment.model.js"
import productModel from "../../DB/models/product.model.js"
import AppError from "../../utils/appError.js"
import { decodeAccessToken } from "../../utils/decodeToken.js"
import httpStatusText from "../../utils/httpStatusText.js"
import stripe from "../../utils/stripe.js"

const CHECKOUT_SESSION_EXPIRES_AFTER_SECONDS = 30 * 60
const CHECKOUT_SESSION_EXPIRES_AFTER_MS = CHECKOUT_SESSION_EXPIRES_AFTER_SECONDS * 1000

const releaseCheckoutSessionReservation = async (filter, dbSession) => {
    const checkoutSession = await checkoutSessionModel.findOneAndUpdate(
        { ...filter, status: "reserved" },
        { $set: { status: "released", releasedAt: new Date() } },
        { new: true, session: dbSession }
    )

    if (!checkoutSession) {
        return null
    }

    for (const item of checkoutSession.items) {
        const updated = await productModel.updateOne(
            { _id: item.product, reservedStock: { $gte: item.quantity } },
            { $inc: { reservedStock: -item.quantity } }
        ).session(dbSession)

        if (updated.modifiedCount === 0) {
            throw new AppError(`Reserved stock for product ${item.product} is not available`)
        }
    }

    return checkoutSession
}

const releaseCheckoutSession = async (filter) => {
    const dbSession = await mongoose.startSession()

    try {
        let releasedSession = null

        await dbSession.withTransaction(async () => {
            releasedSession = await releaseCheckoutSessionReservation(filter, dbSession)
        })

        return releasedSession
    } finally {
        await dbSession.endSession()
    }
}

const addItem = async (req, res, next) => {
    const itemId = req.body.id
    const itemQuantity = +(req.body.quantity)
    const { id } = decodeAccessToken(req)
    const requestedItem = await productModel.findById(itemId)
    if (!requestedItem) {
        return next(new AppError('product not found', 404))
    }

    let cart = await cartModel.findOne({ user: id });
    const cartItem = cart?.products?.find((item) =>
        item.product.toString() === itemId
    )
    const requestedQuantity = (cartItem?.quantity ?? 0) + itemQuantity

    if (requestedItem.availableStock < requestedQuantity) {
        const error = new AppError('requsted quantity is out of stock.', 400)
        return next(error)
    }

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

    const item = cartItem
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
    const cart = await cartModel.findOne({ user: id }).populate('products.product')
    const totalPrice = cart?.products?.reduce((acc, curr) => acc + (curr.quantity * curr.product.price), 0) ?? 0
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
    const dbSession = await mongoose.startSession()
    let cart
    let checkoutSession
    const expiresAt = new Date(Date.now() + CHECKOUT_SESSION_EXPIRES_AFTER_MS)

    try {
        await dbSession.withTransaction(async () => {
            cart = await cartModel.findOne({ user: id })
                .populate('products.product')
                .session(dbSession)

            if (!cart || cart.products.length === 0) {
                throw new AppError("cart is empty", 400)
            }

            for (const item of cart.products) {
                if (!item.product) {
                    throw new AppError("product not found", 404)
                }
                if (item.product.availableStock < item.quantity) {
                    throw new AppError(`Product ${item.product._id} out of stock`, 400)
                }

                const updated = await productModel.updateOne(
                    {
                        _id: item.product._id,
                        $expr: {
                            $gte: [
                                {
                                    $subtract: [
                                        "$stock",
                                        { $ifNull: ["$reservedStock", 0] }
                                    ]
                                },
                                item.quantity
                            ]
                        }
                    },
                    { $inc: { reservedStock: item.quantity } }
                ).session(dbSession)

                if (updated.modifiedCount === 0) {
                    throw new AppError(`Product ${item.product._id} out of stock`, 400)
                }
            }

            const checkoutSessionDocs = await checkoutSessionModel.create([{
                user: id,
                cart: cart._id,
                items: cart.products.map((item) => ({
                    product: item.product._id,
                    quantity: item.quantity
                })),
                status: "reserved",
                expiresAt
            }], { session: dbSession })

            checkoutSession = checkoutSessionDocs[0]
        })
    } finally {
        await dbSession.endSession()
    }

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
        billing_address_collection: "required",
        shipping_address_collection: {
            allowed_countries: ["US", "EG"]
        },

        metadata: {
            userId: id,
            cartId: cart._id.toString(),
            checkoutSessionId: checkoutSession._id.toString()
        },

        expires_at: Math.floor(expiresAt.getTime() / 1000),
        success_url: "https://www.youtube.com/watch?v=3OOHC_UzrKA",
        cancel_url: "https://www.youtube.com/watch?v=3OOHC_UzrKA"
    }

    if (req.body.email) {
        sessionPayload.customer_email = req.body.email
    }

    let session

    try {
        session = await stripe.checkout.sessions.create(sessionPayload)
    } catch (err) {
        await releaseCheckoutSession({ _id: checkoutSession._id })
        throw err
    }

    try {
        await checkoutSessionModel.updateOne(
            { _id: checkoutSession._id },
            { $set: { stripeSessionId: session.id } }
        )
    } catch (err) {
        console.error("Failed to save Stripe checkout session id", err.message)
    }

    res.status(200).json(session)
}


const createOrderFromPaidSession = async (session) => {
    const checkoutSessionId = session.metadata?.checkoutSessionId
    if (!checkoutSessionId) {
        return null
    }

    const dbSession = await mongoose.startSession();

    try {
        let createdOrder = null;

        await dbSession.withTransaction(async () => {
            let payment = await paymentModel.findOne(
                { transactionId: session.payment_intent }
            ).session(dbSession);

            if (payment) {
                const existingOrder = await orderModel.findOne({ payment: payment._id }).session(dbSession);
                if (existingOrder) {
                    createdOrder = existingOrder;
                    return;
                }
            }

            const checkoutSession = await checkoutSessionModel.findOneAndUpdate(
                { _id: checkoutSessionId, status: "reserved" },
                { $set: { status: "paid", paidAt: new Date() } },
                { new: true, session: dbSession }
            )

            if (!checkoutSession) {
                return;
            }

            const cart = await cartModel.findById(checkoutSession.cart)
                .populate('products.product')
                .session(dbSession);

            if (checkoutSession.items.length === 0) {
                return;
            }

            const itemsToConsume = checkoutSession.items

            for (const item of itemsToConsume) {
                const updated = await productModel.updateOne(
                    {
                        _id: item.product,
                        stock: { $gte: item.quantity },
                        reservedStock: { $gte: item.quantity }
                    },
                    {
                        $inc: {
                            stock: -item.quantity,
                            reservedStock: -item.quantity
                        }
                    }
                ).session(dbSession);

                if (updated.modifiedCount === 0) {
                    throw new AppError(`Reserved stock for product ${item.product} is not available`);
                }
            }

            const productIds = itemsToConsume.map((item) => item.product)
            const products = await productModel.find({ _id: { $in: productIds } }).session(dbSession)
            const productsById = new Map(products.map((product) => [product._id.toString(), product]))

            const items = itemsToConsume.map((item) => {
                const product = productsById.get(item.product.toString())
                if (!product) {
                    throw new AppError(`Product ${item.product} not found`)
                }

                return {
                    product: product._id,
                    name: product.name,
                    thumbnail: product.thumbnail,
                    price: product.price,
                    quantity: item.quantity
                }
            });

            const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

            if (!payment) {
                const paymentDocs = await paymentModel.create([{
                    amount: (session.amount_total ?? Math.round(totalPrice * 100)) / 100,
                    status: "paid",
                    transactionId: session.payment_intent,
                    gateway: "stripe"
                }], { session: dbSession });
                payment = paymentDocs[0];
            }

            const shippingAddress = session?.shipping_details?.address ?? session?.customer_details?.address


            const orderDocs = await orderModel.create([{
                items,
                user: checkoutSession.user,
                payment: payment._id,
                delieveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                shippingAddress,
                totalPrice,
                orderStatus: "processing",
            }], { session: dbSession });

            createdOrder = orderDocs[0];

            if (cart) {
                await cartModel.findByIdAndDelete(cart._id).session(dbSession);
            }
        });

        return createdOrder;
    } finally {
        await dbSession.endSession();
    }
};

const stripeWebhook = async (req, res, next) => {
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

        if (event.type === "checkout.session.expired") {
            const session = event.data.object
            const checkoutSessionId = session.metadata?.checkoutSessionId

            await releaseCheckoutSession(
                checkoutSessionId
                    ? { _id: checkoutSessionId }
                    : { stripeSessionId: session.id }
            )
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
    releaseCheckoutSession,
    stripeWebhook
}
