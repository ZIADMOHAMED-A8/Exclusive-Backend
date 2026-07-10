import z from "zod";
import idSchema from "../../utils/idSchema.js";
import paginationSchema from "../../utils/paginationSchema.js";

const orderIdSchema = z.object({
    params: z.object({
        id: idSchema
    })
});

const getOrdersSchema = z.object({
    query: paginationSchema.partial()
});

export {
    orderIdSchema,
    getOrdersSchema
};
