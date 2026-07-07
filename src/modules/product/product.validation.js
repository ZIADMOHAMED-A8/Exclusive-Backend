import { z } from "zod";
import mongoose from "mongoose";
import idSchema from "../../utils/idSchema.js";
import paginationSchema from "../../utils/paginationSchema.js";
const productSchema = z.object({
    name: z
        .string({ error: "Product name is required" })
        .trim()
        .min(1, "Product name is required"),


    price: z.coerce
        .number({ error: "Price is required" })
        .positive("Price must be greater than 0"),

    stock: z.coerce
        .number({ error: "Stock is required" })
        .min(1, "Stock cannot be negative"),
    description: z
        .string({ error: "Description is required" })
        .trim()
        .min(10, "Description must be at least 10 characters"),
    thumbnail: z.any({
        error: "Please provide a thumbnail",
    })
}).strict()
const createProductSchema = z.object({
    body: productSchema

})

const updatedProductSchema = z.object({
    body: productSchema.partial()
        .refine((data) => Object.keys(data).length > 0, { message: 'please provide at least 1 field' }),
    params: idSchema
})

const getProductsSchena = z.object({
    query: paginationSchema
})

const getSingleProductSchema=z.object({
    params:idSchema
})
const deleteProductSchema=z.object({
    params:idSchema
})

const getProductsBySellerSchema=z.object({
    params:idSchema,
    query:paginationSchema
})

export {
    createProductSchema,
    updatedProductSchema,
    getProductsSchena,
    getSingleProductSchema,
    deleteProductSchema,
    getProductsBySellerSchema
}