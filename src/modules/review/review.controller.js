import { Router } from "express";
import { addReview, deleteReview, editReview, getProductReviews } from "./review.service.js";
import authorize from "../../middlewares/authorize.js";
import roles from "../../utils/rolesArray.js";
import validate from "../../middlewares/validate.js";
import asyncWrapper from "../../middlewares/asyncWrapper.js";
import { addReviewSchema, editReviewSchema, getProductReviewsSchema, reviewIdSchema } from "./review.validation.js";

const router=Router()

router.route('/product/:id')
    .get(authorize(Object.values(roles)), validate(getProductReviewsSchema), asyncWrapper(getProductReviews))

router.route('/:id')
    .post(authorize([roles.user]), validate(addReviewSchema), asyncWrapper(addReview))
    .patch(authorize([roles.user]), validate(editReviewSchema), asyncWrapper(editReview))
    .delete(authorize([roles.user]), validate(reviewIdSchema), asyncWrapper(deleteReview))









export default router
