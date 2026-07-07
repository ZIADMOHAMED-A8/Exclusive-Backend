import z from "zod"


export default 
     z.object({
        id: z.string("please provide a user id")
            .regex(/^[0-9a-fA-F]{24}$/, "please provide a valid user id")
    })
