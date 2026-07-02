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

    },
    refreshToken: {
        ...stringRequiredFields,

    }
})

userModel.set("toJSON", {
    transform(doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.__v;
        return ret;
    }
});

userModel.set("toObject", {
    transform(doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.__v;
        return ret;
    }
});

export default mongoose.model('users', userModel)