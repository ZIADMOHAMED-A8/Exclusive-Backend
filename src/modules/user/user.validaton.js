import z from "zod"
const registerSchema = z.object({
    body: z.object({
        name: z.string('name should be a string').min(3, "name should be at least 3 charachters"),
        email: z.email('please provide a valid email'),
        password: z.string({
            error: "please provide a password"
        }).min(8, 'password must be at least 8 charachters')
            .regex(/[A-Z]/, "Must contain an uppercase letter")
            .regex(/[a-z]/, "Must contain a lowercase letter")
            .regex(/[0-9]/, "Must contain a number")
            .regex(/[^A-Za-z0-9]/, "Must contain a special character")
    })
})





export {
    registerSchema
}