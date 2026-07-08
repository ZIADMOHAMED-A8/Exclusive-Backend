import { error } from "console"
import connectDB from "./DB/DbConnection.js"
import userRouter from "./modules/user/user.controller.js"
import httpStatusText from "./utils/httpStatusText.js"
import { productRouter } from "./modules/product/product.controller.js"
import cartRouter from "./modules/cart/cart.controller.js"
const bootstrap = (app, express) => {
    app.use(express.json())
    connectDB()
    app.use('/user', userRouter)
    app.use('/product',productRouter)
    app.use('/cart',cartRouter)



    app.use((err, req, res, next) => {
        console.log(err)
        res.status(err.statusCode || 500).json({
            status: httpStatusText.FAIL,
            message: err.message
        });
    });
}
export default bootstrap