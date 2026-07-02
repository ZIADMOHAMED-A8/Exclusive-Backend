import { Router } from "express";
import { register } from "./user.service.js";
import validate from "../../middlewares/validate.js";
import { registerSchema } from "./user.validaton.js";
import asyncWrapper from "../../middlewares/asyncWrapper.js";
const router=Router()


router.post('/register',validate(registerSchema),asyncWrapper(register))


export default router 