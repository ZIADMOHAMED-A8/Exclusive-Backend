import z from "zod";
import idSchema from "../../utils/idSchema.js";
import paginationSchema from "../../utils/paginationSchema.js";

const reviewBodySchema = z.object({
    stars: z.coerce
        .number({ error: "Stars are required" })
        .min(1, "Stars must be at least 1")
        .max(5, "Stars cannot be more than 5"),
    review: z
        .string()
        .trim()
        .min(3, "Review must be at least 3 characters")
        .optional()
}).strict();

const addReviewSchema = z.object({
    params: z.object({
        id: idSchema
    }),
    body: reviewBodySchema
});

const editReviewSchema = z.object({
    params: z.object({
        id: idSchema
    }),
    body: reviewBodySchema
        .partial()
        .refine((data) => Object.keys(data).length > 0, {
            message: "please provide at least 1 field"
        })
});

const reviewIdSchema = z.object({
    params: z.object({
        id: idSchema
    })
});

const getProductReviewsSchema = z.object({
    params: z.object({
        id: idSchema
    }),
    query: paginationSchema.partial()
});

export {
    addReviewSchema,
    editReviewSchema,
    reviewIdSchema,
    getProductReviewsSchema
};
