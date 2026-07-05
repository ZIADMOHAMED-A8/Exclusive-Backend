import z from "zod"

const passwordSchema = z.string({
    error: "please provide a password"
}).min(8, 'password must be at least 8 charachters')
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^A-Za-z0-9]/, "Must contain a special character")
const registerSchema = z.object({
    body: z.object({
        name: z.string('name should be a string')
        .min(3, "name should be at least 3 charachters"),
        email: z.email('please provide a valid email'),
        password: passwordSchema,
        phone: z
            .string("please provide your phone number")
            .regex(/^01[0125]\d{8}$/, "Please provide a valid Egyptian phone number"),
        addresses:z.array(z.string('expecting a string'),'please provide addresses as an array').optional()
    }).strict()
})

const loginSchema = z.object({
    body: z.object({
        email: z.email('please provide a valid email'),
        password: passwordSchema
    })
})

const userIdSchema = z.object({
    params: z.object({
        id: z.string("please provide a user id")
            .regex(/^[0-9a-fA-F]{24}$/, "please provide a valid user id")
    })
})

const myAccountUpdateSchema = z.object({
    body: z.object({
        name: z.string('name should be a string')
            .min(3, "name should be at least 3 charachters").optional(),
        email: z.email('please provide a valid email').optional(),
        password: passwordSchema.optional(),
        phone: z
            .string("please provide your phone number")
            .regex(/^01[0125]\d{8}$/, "Please provide a valid Egyptian phone number").optional(),
        addresses: z.array(z.string('expecting a string'), 'please provide addresses as an array').optional()
    }).strict().refine((data) => Object.keys(data).length > 0, {
        message: "please provide at least one field to update"
    })
})

const createUserSchema = z.object({
    body: z.object({
        name: z.string('name should be a string')
            .min(3, "name should be at least 3 charachters"),
        email: z.email('please provide a valid email'),
        password: passwordSchema,
        phone: z
            .string("please provide your phone number")
            .regex(/^01[0125]\d{8}$/, "Please provide a valid Egyptian phone number"),
        role: z.enum(['admin', 'user'], "please provide the role").optional(),
        addresses: z.array(z.string('expecting a string'), 'please provide addresses as an array').optional()
    }).strict()
})

const updateUserSchema = z.object({
    params: userIdSchema.shape.params,
    body: z.object({
        name: z.string('name should be a string')
            .min(3, "name should be at least 3 charachters").optional(),
        email: z.email('please provide a valid email').optional(),
        password: passwordSchema.optional(),
        phone: z
            .string("please provide your phone number")
            .regex(/^01[0125]\d{8}$/, "Please provide a valid Egyptian phone number").optional(),
        role: z.enum(['admin', 'user'], "please provide the role").optional(),
        addresses: z.array(z.string('expecting a string'), 'please provide addresses as an array').optional()
    }).strict().refine((data) => Object.keys(data).length > 0, {
        message: "please provide at least one field to update"
    })
})

// const refreshSchema=z.object({
//     body:z.object({
//         id:z.jwt('please provide a valid jwt')
//     })
// })

export {
    registerSchema,
    loginSchema,
    userIdSchema,
    myAccountUpdateSchema,
    createUserSchema,
    updateUserSchema,
    // refreshSchema
}
