import { Router } from "express";
import { createUser, deleteMyAccount, deleteUser, getMyAccount, getUser, getUsers, login, refresh, register, updateMyAccount, updateUser } from "./user.service.js";
import validate from "../../middlewares/validate.js";
import { createUserSchema, loginSchema, myAccountUpdateSchema, registerSchema, updateUserSchema, userIdSchema } from "./user.validaton.js";
import asyncWrapper from "../../middlewares/asyncWrapper.js";
import roles from "../../utils/rolesArray.js";
import authorize from "../../middlewares/authorize.js";
const router=Router()
const authenticatedRoles=[roles.admin,roles.user]


router.post('/register',validate(registerSchema),asyncWrapper(register))
router.post('/login',validate(loginSchema),asyncWrapper(login))
router.post('/refresh',asyncWrapper(refresh))
router.route('/me')
    .get(authorize(authenticatedRoles), asyncWrapper(getMyAccount))
    .patch(authorize(authenticatedRoles), validate(myAccountUpdateSchema), asyncWrapper(updateMyAccount))
    .delete(authorize(authenticatedRoles), asyncWrapper(deleteMyAccount))

router.route('/')
    .get(authorize([roles.admin]), asyncWrapper(getUsers))
    .post(authorize([roles.admin]), validate(createUserSchema), asyncWrapper(createUser))

router.route('/:id')
    .get(authorize([roles.admin]),validate(userIdSchema), asyncWrapper(getUser))
    .patch(authorize([roles.admin]), validate(updateUserSchema), asyncWrapper(updateUser))
    .delete(authorize([roles.admin]), validate(userIdSchema), asyncWrapper(deleteUser))




export default router 
