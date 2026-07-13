import connectDB from "./DB/DbConnection.js"
import userRouter from "./modules/user/user.controller.js"
import httpStatusText from "./utils/httpStatusText.js"
import { productRouter } from "./modules/product/product.controller.js"
import cartRouter from "./modules/cart/cart.controller.js"
import orderRouter from "./modules/order/order.controller.js"
import { stripeWebhook } from "./modules/cart/cart.service.js"
import reviewRouter from "./modules/review/review.controller.js"
import { startCheckoutSessionJob } from "./jobs/checkoutSession.job.js"

const bootstrap = (app, express) => {
    app.post('/cart/webhook', express.raw({ type: 'application/json' }), stripeWebhook)
    app.use(express.json())
    connectDB().then(() => {
        startCheckoutSessionJob()
    })
    app.use('/user', userRouter)
    app.use('/product',productRouter)
    app.use('/cart',cartRouter)
    app.use('/order',orderRouter)
    app.use('/review',reviewRouter)


    app.use((err, req, res, next) => {
        res.status(err.statusCode || 500).json({
            status: httpStatusText.FAIL,
            message: err.message
        });
    });
}
export default bootstrap
