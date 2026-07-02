import user from "../../DB/models/user.model.js"
import { generateAccessToken, generatRefreshToken } from "../../utils/generateTokens.js"
import { hash } from "../../utils/hash.js"


const register = async (req, res, next) => {
    const data = req.body
    console.log(data)
    let newUser = new user({
        ...data
    })

    const hashedPassword = await hash(data.password)

    const accessToken = generateAccessToken({
        id: newUser._id,
        email: newUser.email
    })
    const refreshToken = generatRefreshToken({
        id: newUser._id,
        email: newUser.email
    })
    const hashedRefreshToken = await hash(refreshToken)
    newUser.refreshToken=hashedRefreshToken
    newUser.password=hashedPassword
    await newUser.save()
    newUser=newUser.toObject()
    delete newUser.password
    delete newUser.__v

    res.status(201).json({
        Status: 'SUCCESS',
        data: {
            ...newUser,
            accessToken,
            refreshToken

        }
    })
}


export {
    register
}