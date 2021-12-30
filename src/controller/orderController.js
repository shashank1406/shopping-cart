
const mongoose = require('mongoose')
const orderModel = require('../model/orderModel')



// ------------------------  validation functions ----------------------------------------------------------------------------

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (value === 0) return false
    return true;
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}


// --------------------- 14th api to create order --------------------------------------------------------------------------------

const createOrder = async function (req, res) {
    try {
        let requestBody = req.body;
        const userIdInParams = req.params.userId
        const jwtUserId = req.userId

        const { userId, totalPrice, totalItems, items, totalQuantity } = requestBody

        //  authroization

        if (!(userIdInParams === jwtUserId)) {
            return res.status(400).send({ status: false, msg: "unauthorized access" })
        }

        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Please provide cart details' });
            return;
        }
        if (!isValid(userId)) {
            return res.status(400).send({ status: true, message: 'userid is required in the request body' })
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: `${userId} is not a valid user id` })
        }
        if (items.length === 0) {
            return res.status(400).send({ status: false, msg: 'items cant be empty' })
        }
        if (!isValid(items)) {
            return res.status(400).send({ status: false, message: 'items is required in the request body' })
        }
        if (!isValid(totalPrice)) {
            return res.status(400).send({ status: false, message: 'totalPrice is required in the request body' })
        }
        if (!isValid(totalItems)) {
            return res.status(400).send({ status: false, message: 'totalItems is required in the request body' })
        }
        if (!isValid(totalQuantity)) {
            return res.status(400).send({ status: false, message: 'totalQuantity required in the request body' })
        }
        const createProduct = await orderModel.create(requestBody);
        res.status(201).send({ status: true, msg: 'sucesfully created order', data: createProduct })

    } catch (error) {
        res.status(500).send({ status: false, Message: error.message })
    }
}

// --------------------- 15th api to put order  detail--------------------------------------------------------------------------------


const updateOrderDetail = async function (req, res) {
    try {
        let requestBody = req.body;
        const userId = req.params.userId
        const jwtUserId = req.userId

        const { orderId } = requestBody

        //  authroization

        if (!(userId === jwtUserId)) {
            return res.status(400).send({ status: false, msg: "unauthorized access" })
        }

        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Please provide cart details' });
            return;
        }
        if (!isValid(orderId)) {
            return res.status(400).send({ status: true, message: 'orderId is required in the request body' })
        }
        if (!isValidObjectId(orderId)) {
            return res.status(400).send({ status: false, message: `${orderId} is not a valid user id` })
        }
        const checkOrder = await orderModel.findOne({ _id: orderId, isDeleted: false })
        if (!(checkOrder.userId == userId)) {
            return res.status(400).send({ status: true, message: 'order not blongs to the user ' })
        } ""
        if (!(checkOrder.cancellable === true)) {
            return res.status(400).send({ status: true, message: 'order didnt have the cancellable policy ' })
        }
        let updateOrder = await orderModel.findOneAndUpdate({ _id: orderId }, { status: "canceled" }, { new: true })
        res.status(200).send({ status: true, msg: 'sucesfully updated', data: updateOrder })

    } catch (error) {
        res.status(500).send({ status: false, Message: error.message })
    }
}

// --------------------------------------------------------------------------------------------------------------------------
module.exports.createOrder = createOrder
module.exports.updateOrderDetail = updateOrderDetail