import { Router } from "express";
import authorize from "../../middlewares/authorize.js";
import validate from "../../middlewares/validate.js";
import roles from "../../utils/rolesArray.js";
import { deleteOrder, getOrders, getSingleOrder } from "./order.service.js";
import { getOrdersSchema, orderIdSchema } from "./order.validation.js";
import asyncWrapper from "../../middlewares/asyncWrapper.js";

const router = Router();

router.route("/")
    .get(authorize([roles.admin]), validate(getOrdersSchema), asyncWrapper(getOrders));

router.route("/:id")
    .get(authorize([roles.admin]), validate(orderIdSchema), asyncWrapper(getSingleOrder))
    .delete(authorize([roles.admin]), validate(orderIdSchema), asyncWrapper(deleteOrder));

export default router;
