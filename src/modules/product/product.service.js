import productModel from "../../DB/models/product.model.js"
import { decodeAccessToken } from "../../utils/decodeToken.js"
import httpStatusText from "../../utils/httpStatusText.js"

const addProduct = async (req, res, next) => {
    console.log('test tt')
    const data = req.body
    const { id } = decodeAccessToken(req)
    const newProduct = new productModel(
        {
            ...data,
            thumbnail: req.file.path,
            seller: id
        }
    )
    await newProduct.save()
    res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: {
            product: {
                ...data,
                thumbnail: req.file.path,
                seller: id
            },

        }
    })
}


export {
    addProduct
}