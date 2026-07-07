
import AppError from "../utils/appError.js"
function validate(schema) {
    return (req, res, next) => {
        console.log(req.body,"body ss")
        req.body= req.body ?? {}
        console.log(schema,'aaaaa')
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
        })
        if (!result.success) {
            console.log(result.error)
            const error = new AppError(result.error.issues, 400)
            return next(error)
        }
        next()
    }
}


export default validate