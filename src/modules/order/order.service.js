import orderModel from "../../DB/models/order.model.js";
import AppError from "../../utils/appError.js";
import httpStatusText from "../../utils/httpStatusText.js";

const getOrders = async (req, res, next) => {
    const page = +(req.query.page ?? 1);
    const limit = +(req.query.limit ?? 10);
    const skip = (page - 1) * limit;

    const orders = await orderModel.find()
        .populate("user", "name email phone")
        .populate("payment")
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        results: orders.length,
        data: {
            orders
        }
    });
};

const getSingleOrder = async (req, res, next) => {
    const { id } = req.params;
    const order = await orderModel.findById(id)
        .populate("user", "name email phone")
        .populate("payment");

    if (!order) {
        return next(new AppError("order not found", 404));
    }

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            order
        }
    });
};

const deleteOrder = async (req, res, next) => {
    const { id } = req.params;
    const order = await orderModel.findByIdAndDelete(id);

    if (!order) {
        return next(new AppError("order not found", 404));
    }

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            order
        }
    });
};

export {
    getOrders,
    getSingleOrder,
    deleteOrder
};
