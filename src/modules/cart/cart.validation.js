import mongoose from "mongoose";
import z from "zod";
import idSchema from "../../utils/idSchema.js";

const addItemSchema=z.object({
    body:z.object({
        id:idSchema,
        quantity:z.coerce.number('please provide a quantity')
    })
})
const deleteItemSchema=z.object({
    params:z.object({
        id:idSchema
    })
})
export {
    addItemSchema,
    deleteItemSchema
}