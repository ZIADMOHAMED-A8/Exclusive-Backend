import user from "../../DB/models/user.model.js"
import AppError from "../../utils/appError.js"
import { decodeRefreshToken } from "../../utils/decodeToken.js"
import { generateAccessToken, generatRefreshToken } from "../../utils/generateTokens.js"
import { compare, hash } from "../../utils/hash.js"
import httpStatusText from "../../utils/httpStatusText.js"


const register = async (req, res, next) => {
    const data = req.body
    let newUser = new user({
        ...data
    })
    const isExisting=await user.findOne({email:req.body.email})
    if(isExisting){
        const error=new AppError('user already exists')
        return next(error)
    }
    const hashedPassword = await hash(data.password)

    const accessToken = generateAccessToken({
        id: newUser._id,
        email: newUser.email,
        role:newUser.role

    })
    const refreshToken = generatRefreshToken({
        id: newUser._id,
        email: newUser.email,
        role:newUser.role

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

const createUser = async (req, res, next) => {
    const data = req.body
    const existingUser = await user.findOne({ email: data.email })

    if (existingUser) {
        return next(new AppError('Email already exists', 409))
    }

    const hashedPassword = await hash(data.password)
    let newUser = await user.create({
        ...data,
        password: hashedPassword
    })

    newUser = newUser.toObject()

    res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: {
            user: newUser
        }
    })
}

const getMyAccount = async (req, res, next) => {
    const existingUser = await user.findById(req.user.id)

    if (!existingUser) {
        return next(new AppError('User not found', 404))
    }

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            user: existingUser
        }
    })
}

const getUsers = async (req, res, next) => {
    const users = await user.find()

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        results: users.length,
        data: {
            users
        }
    })
}

const getUser = async (req, res, next) => {
    const { id } = req.params
    const existingUser = await user.findById(id)

    if (!existingUser) {
        return next(new AppError('User not found', 404))
    }

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            user: existingUser
        }
    })
}

const updateUserById = async (id, data, next) => {
    if (data.email) {
        const emailOwner = await user.findOne({ email: data.email, _id: { $ne: id } })

        if (emailOwner) {
            return next(new AppError('Email already exists', 409))
        }
    }

    if (data.password) {
        data.password = await hash(data.password)
    }

    const updatedUser = await user.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
    })

    if (!updatedUser) {
        return next(new AppError('User not found', 404))
    }

    return updatedUser
}

const updateMyAccount = async (req, res, next) => {
    const updatedUser = await updateUserById(req.user.id, { ...req.body }, next)

    if (!updatedUser) {
        return
    }

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            user: updatedUser
        }
    })
}

const updateUser = async (req, res, next) => {
    const { id } = req.params
    const updatedUser = await updateUserById(id, { ...req.body }, next)

    if (!updatedUser) {
        return
    }

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            user: updatedUser
        }
    })
}

const deleteMyAccount = async (req, res, next) => {
    const deletedUser = await user.findByIdAndDelete(req.user.id)

    if (!deletedUser) {
        return next(new AppError('User not found', 404))
    }

    res.status(204).send()
}

const deleteUser = async (req, res, next) => {
    const { id } = req.params
    const deletedUser = await user.findByIdAndDelete(id)

    if (!deletedUser) {
        return next(new AppError('User not found', 404))
    }

    res.status(204).send()
}

const login = async (req, res, next) => {
    const { email, password } = req.body
    const existingUser = await user.findOne({ email })
    if (!existingUser) {
        const error = new AppError('Account not found', 404)
        return next(error)
    }
    const result = await compare(password, existingUser.password)
    if (!result) {
        const error = new AppError('Wrong Password', 404)
        return next(error)
    }
    const accessToken = generateAccessToken({
        email: existingUser.email,
        id: existingUser._id,
        role:existingUser.role
    })
    const refreshToken = generatRefreshToken({
        email: existingUser.email,
        id: existingUser._id,
        role:existingUser.role

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
        email: existingUser.email,
        role:existingUser.role

    })
    const refreshToken = generatRefreshToken({
        id: existingUser._id,
        email: existingUser.email,
        role:existingUser.role

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
    refresh,
    getMyAccount,
    updateMyAccount,
    deleteMyAccount,
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser
}
