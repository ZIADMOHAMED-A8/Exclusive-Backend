import z from "zod"


export default z.object({
    page:z.coerce.number('please provide a page number'),
    limit:z.coerce.number('please provide a limit'),
})