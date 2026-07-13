import productModel from "../DB/models/product.model.js"
import AppError from "../utils/appError.js"

const validateProduct=async (req,res,next)=>{
    const id=req.body.id ?? req.params.id
    const product=await productModel.findOne({_id:id})
    if(!product){
        const error=new AppError('product not found')
        return next(error)
    }
    next()
    
}

export default validateProduct