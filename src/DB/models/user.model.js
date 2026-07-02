import mongoose from "mongoose";


const stringRequiredFields = {
    type: String,
    required: true,

}

const userModel = new mongoose.Schema({
    name: stringRequiredFields,
    email: stringRequiredFields,
    password: {
        ...stringRequiredFields,
        select: false
    },
    refreshToken:  {
    ...stringRequiredFields,
    select: false
}
})

export default mongoose.model('users', userModel)