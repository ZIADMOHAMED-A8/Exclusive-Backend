import productModel from "../DB/models/product.model.js";
import AppError from "../utils/appError.js";
import { decodeAccessToken } from "../utils/decodeToken.js";

const checkIfSameSeller=async (req,res,next)=>{
    const product=await productModel.findById(req.params.id)
    const {id}=decodeAccessToken(req)

    if(product.seller.toString()!==id){
        const error=new AppError('you are not allowed to delete this item',403)
        return next(error)
    }
    next()


}
export default checkIfSameSeller
