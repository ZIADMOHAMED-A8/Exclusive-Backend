import { error } from "console"
import connectDB from "./DB/DbConnection.js"
import userRouter from "./modules/user/user.controller.js"
import httpStatusText from "./utils/httpStatusText.js"
const bootstrap = (app, express) => {
    app.use(express.json())
    connectDB()
    app.use('/user', userRouter)





    app.use((err, req, res, next) => {
        console.log(err)
        res.status(err.statusCode || 500).json({
            status: httpStatusText.FAIL,
            message: err.message
        });
    });
}
export default bootstrap