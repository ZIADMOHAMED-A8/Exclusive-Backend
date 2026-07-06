function addImageToBody(req,res,next){
    const imageLink=req.file.path;
    req.body={
        ...req.body,
        thumbnail:imageLink
    }
    next()
}

export default addImageToBody