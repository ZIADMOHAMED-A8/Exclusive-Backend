import z from "zod"
import { ObjectId } from "mongodb";

export default
    z.string().refine(
        (value) => ObjectId.isValid(value),
        { message: "Invalid MongoDB ObjectId" }
    )
