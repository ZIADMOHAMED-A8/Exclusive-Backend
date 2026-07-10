import { Router } from "express";
import { cancelMyOrder, deleteMyAccount, deleteUser, getMyAccount, getMyOrders, getUser, getUsers, login, refresh, register, updateMyAccount, updateUser } from "./user.service.js";
import validate from "../../middlewares/validate.js";
import {  loginSchema, myAccountUpdateSchema, registerSchema, updateUserSchema, userIdSchema } from "./user.validaton.js";
import { orderIdSchema } from "../order/order.validation.js";
import asyncWrapper from "../../middlewares/asyncWrapper.js";
import roles from "../../utils/rolesArray.js";
import authorize from "../../middlewares/authorize.js";
const router=Router()
const authenticatedRoles=[roles.admin,roles.user,roles.seller]


router.post('/register',validate(registerSchema),asyncWrapper(register))
router.post('/login',validate(loginSchema),asyncWrapper(login))
router.post('/refresh',asyncWrapper(refresh))
router.route('/me')
    .get(authorize(authenticatedRoles), asyncWrapper(getMyAccount))
    .patch(authorize(authenticatedRoles), validate(myAccountUpdateSchema), asyncWrapper(updateMyAccount))
    .delete(authorize(authenticatedRoles), asyncWrapper(deleteMyAccount))

router.route('/me/orders')
    .get(authorize(authenticatedRoles), asyncWrapper(getMyOrders))

router.route('/me/order/:id')
    .delete(authorize(authenticatedRoles), validate(orderIdSchema), asyncWrapper(cancelMyOrder))

router.route('/')
    .get(authorize([roles.admin]), asyncWrapper(getUsers))

router.route('/:id')
    .get(authorize([roles.admin]),validate(userIdSchema), asyncWrapper(getUser))
    .patch(authorize([roles.admin]), validate(updateUserSchema), asyncWrapper(updateUser))
    .delete(authorize([roles.admin]), validate(userIdSchema), asyncWrapper(deleteUser))




export default router 
