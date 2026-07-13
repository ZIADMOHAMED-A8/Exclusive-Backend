
import AppError from "../utils/appError.js"
function validate(schema) {
    return (req, res, next) => {
        req.body= req.body ?? {}
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
        })
        if (!result.success) {
            const error = new AppError(result.error.issues, 400)
            return next(error)
        }
        next()
    }
}


export default validate
