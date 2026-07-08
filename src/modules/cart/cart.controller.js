import { Router } from "express";
import { addItem, deleteCart, getCart, removeItem } from "./cart.service.js";
import validate from "../../middlewares/validate.js";
import { addItemSchema, deleteItemSchema } from "./cart.validation.js";
import authorize from "../../middlewares/authorize.js";
import roles from "../../utils/rolesArray.js";
import validateProduct from "../../middlewares/validateProduct.js";

const router = Router()

router.route('/')
    .post(authorize(Object.values(roles)), validate(addItemSchema), validateProduct, addItem)
    .delete(authorize(Object.values(roles)), deleteCart)
    .get(authorize(Object.values(roles)), getCart)
router.route('/:id')
    .delete(authorize(Object.values(roles)), validate(deleteItemSchema), validateProduct, removeItem)


export default router