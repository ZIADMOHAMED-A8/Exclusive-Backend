import { z } from "zod";
import mongoose from "mongoose";

const createProductSchema = z.object({
    body: z.object({
        name: z
            .string({ error: "Product name is required" })
            .trim()
            .min(1, "Product name is required"),


        price: z.coerce
            .number({ error: "Price is required" })
            .positive("Price must be greater than 0"),

        stock: z.coerce
            .number({ error: "Stock is required" })
            .min(0, "Stock cannot be negative"),
        description: z
            .string({ error: "Description is required" })
            .trim()
            .min(10, "Description must be at least 10 characters"),
    }).strict(),
    file: z.any("please provide a thumbnail")
})




export {
    createProductSchema
}