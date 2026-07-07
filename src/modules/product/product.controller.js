import { Router } from "express";
import { addProduct, deleteProduct, editProduct, getProducts, getProductsBySeller, getSingleProduct } from "./product.service.js";
import roles from "../../utils/rolesArray.js";
import authorize from '../../middlewares/authorize.js'
import upload from "../../middlewares/upload.js";
import validate from "../../middlewares/validate.js";
import { createProductSchema, deleteProductSchema, getProductsBySellerSchema, getProductsSchena, getSingleProductSchema, updatedProductSchema } from "./product.validation.js";
import addImageToBody from "../../middlewares/addImageToBody.js";
import validateThumbail from "../../middlewares/validateThumbnail.js";
import checkIfSameSeller from "../../middlewares/checkIfSameSeller.js";
const router=Router()

router.route('/')
    .post(authorize([roles.seller]),
    upload.single('thumbnail')
    ,validateThumbail,
    addImageToBody,
    validate(createProductSchema),
    addProduct)
    .get(authorize(Object.values(roles)),validate(getProductsSchena),getProducts)

router.route('/:id')
    .patch(authorize([roles.seller])
    ,upload.single('thumbnail'),
    addImageToBody,
    validate(updatedProductSchema),
    editProduct)
    .get(authorize(Object.values(roles)),validate(getSingleProductSchema),getSingleProduct)
    .delete(authorize(Object.values(roles)),validate(deleteProductSchema),checkIfSameSeller,deleteProduct)

router.route('/seller/:id')
    .get(authorize(Object.values(roles)),validate(getProductsBySellerSchema),getProductsBySeller)



export {
    router as productRouter
}