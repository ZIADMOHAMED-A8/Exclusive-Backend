
import AppError from "../utils/appError.js"
function validate(schema) {
    return (req, res, next) => {
        console.log(schema instanceof Object);
        console.log(req.body);
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
            file:req.file
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