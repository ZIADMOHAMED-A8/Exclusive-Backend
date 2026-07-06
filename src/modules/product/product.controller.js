import { Router } from "express";
import { addProduct } from "./product.service.js";
import roles from "../../utils/rolesArray.js";
import authorize from '../../middlewares/authorize.js'
import upload from "../../middlewares/upload.js";
import validate from "../../middlewares/validate.js";
import { createProductSchema } from "./product.validation.js";
const router=Router()

router.post('/',authorize([roles.seller]),upload.single('thumbnail'),validate(createProductSchema),addProduct)


export {
    router as productRouter
}