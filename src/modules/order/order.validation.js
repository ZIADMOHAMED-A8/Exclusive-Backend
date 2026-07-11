import z from "zod";
import idSchema from "../../utils/idSchema.js";
import paginationSchema from "../../utils/paginationSchema.js";

const orderStatuses = [
    "processing",
    "shipped",
    "delivered",
    "cancelled"
];

const orderIdSchema = z.object({
    params: z.object({
        id: idSchema
    })
});

const updateOrderStatusSchema = z.object({
    params: z.object({
        id: idSchema,
        status: z.enum(orderStatuses)
    })
});

const getOrdersSchema = z.object({
    query: paginationSchema.partial()
});

export {
    orderIdSchema,
    updateOrderStatusSchema,
    getOrdersSchema
};
