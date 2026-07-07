import AppError from "../utils/appError.js";

function validateThumbail(req, res, next) {
    const imageLink = req?.file?.path;
    if (!imageLink) {
        const error = new AppError('please provide a thumbnail', 400)
        return next(error)
    }
    next()
}
export default validateThumbail