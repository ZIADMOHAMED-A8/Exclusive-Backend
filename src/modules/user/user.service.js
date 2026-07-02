import user from "../../DB/models/user.model.js"
import AppError from "../../utils/appError.js"
import { decodeRefreshToken } from "../../utils/decodeToken.js"
import { generateAccessToken, generatRefreshToken } from "../../utils/generateTokens.js"
import { compare, hash } from "../../utils/hash.js"
import httpStatusText from "../../utils/httpStatusText.js"


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
    newUser.refreshToken = hashedRefreshToken
    newUser.password = hashedPassword
    await newUser.save()
    newUser = newUser.toObject()

    res.status(201).json({
        Status: 'SUCCESS',
        data: {
            ...newUser,
            accessToken,
            refreshToken

        }
    })
}

const login = async (req, res, next) => {
    const { email, password } = req.body
    const existingUser = await user.findOne({ email })
    console.log(existingUser)
    if (!existingUser) {
        const error = new AppError('Account not found', 404)
        next(error)
    }
    const result = await compare(password, existingUser.password)
    console.log(result)
    if (!result) {
        const error = new AppError('Wrong Password', 404)
        next(error)
    }
    const accessToken = generateAccessToken({
        email: existingUser.email,
        id: existingUser._id
    })
    const refreshToken = generatRefreshToken({
        email: existingUser.email,
        id: existingUser._id
    })
    const hashedToken = await hash(refreshToken)
    await user.findOneAndUpdate({ _id: existingUser._id }, { refreshToken: hashedToken })
    const userObject = existingUser.toObject()

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            user: {
                ...userObject,
                accessToken,
                refreshToken
            }

        }
    })
}

const refresh = async (req, res, next) => {
    const { id } = decodeRefreshToken(req)
    const existingUser = await user.findById(id)
    if (!existingUser) {
        const error = new AppError('user not found')
        return next(error)
    }
    const accessToken = generateAccessToken({
        id: existingUser._id,
        email: existingUser.email
    })
    const refreshToken = generatRefreshToken({
        id: existingUser._id,
        email: existingUser.email
    })
    const hashedToken = await hash(refreshToken)
    await user.findByIdAndUpdate(id, { refreshToken: hashedToken })
    res.status(200).json({
        accessToken,
        refreshToken
    })

}
export {
    register,
    login,
    refresh
}