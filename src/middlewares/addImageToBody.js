import AppError from "../utils/appError.js";

function addImageToBody(req,res,next){
    const imageLink=req?.file?.path;
    if(!imageLink){
        return next()
    }
    req.body={
        ...req.body,
        thumbnail:imageLink
    }
    next()
}

export default addImageToBody