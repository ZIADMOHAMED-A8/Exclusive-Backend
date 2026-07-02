import { Router } from "express";
import { login, register } from "./user.service.js";
import validate from "../../middlewares/validate.js";
import { loginSchema, registerSchema } from "./user.validaton.js";
import asyncWrapper from "../../middlewares/asyncWrapper.js";
const router=Router()


router.post('/register',validate(registerSchema),asyncWrapper(register))
router.post('/login',validate(loginSchema),asyncWrapper(login))



export default router 