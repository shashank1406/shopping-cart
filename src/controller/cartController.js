const cartModel = require('../model/cartModel')
const userModel = require('../model/userModel')
const productModel = require('../model/productModel')
const mongoose = require('mongoose')



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


// --------------------- TEHTH API TO CREATE NEW CART AND AD PRODUCT IN CART -------------------------------------------


const createCart = async function (req, res) {

    try {
        const requestBody = req.body
        const userId = req.params.userId
        const jwtUserId = req.userId
        let { productId, cartId } = requestBody

        //  authroization

        if (!(userId === jwtUserId)) {
            return res.status(400).send({ status: false, msg: "unauthorized access" })
        }

        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Please provide cart details' });
            return;
        }

        if (cartId) {
            if (!isValid(cartId)) {
                return res.status(400).send({ status: true, message: 'cartId is required in the request body' })
            }
        }

        if (!isValid(productId)) {
            return res.status(400).send({ status: true, message: 'productId is required in the request body' })
        }

        const checkProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!checkProduct) {
            return res.status(400).send({ status: true, message: 'product not exist or already deleted' })
        }

        const checkCartExist = await cartModel.findOne({ _id: cartId, userId: userId })

        if (!checkCartExist) {
            let createCartObject = { userId: userId, items: [{ productId: productId, quantity: 1 }], totalPrice: checkProduct.price, totalItems: 1 }
            const createCart = await cartModel.create(createCartObject);
            res.status(201).send({ statu: true, msg: 'sucesfully created cart ', data: createCart })
        }

        let array = checkCartExist.items
        for (let i = 0; i < array.length; i++) {
            if (array[i].productId == productId) {
                array[i].quantity = array[i].quantity + 1
                const updateCart = await cartModel.findByIdAndUpdate({ _id: cartId }, { items: array, totalPrice: checkCartExist.totalPrice + checkProduct.price }, { new: true });
                return res.status(200).send({ status: true, msg: 'sucesfully add product quentity', data: updateCart });
            }
        }
        let updateCartObject = {
            $addToSet: { items: { productId: productId, quantity: 1 } },
            totalPrice: checkCartExist.totalPrice + checkProduct.price,
            totalItems: checkCartExist.totalItems + 1
        }
        const updateCart = await cartModel.findOneAndUpdate({ userId: userId }, updateCartObject, { new: true });
        res.status(200).send({ status: true, msg: 'sucesfully add  new product', data: updateCart })

    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, message: error.message });
    }

}

// --------------------- ELEVENTH API TO UPDATE CART   ------------------------------------------------------------------------

const updateCart = async function (req, res) {

    try {
        const userId = req.params.userId
        const requestBody = req.body
        const jwtUserId = req.userId
        const { cartId, productId, removeProduct } = requestBody

        //  authroization

        if (!(userId === jwtUserId)) {
            return res.status(400).send({ status: false, msg: "unauthorized access" })
        }
        if (!isValid(requestBody)) {
            const cart = await cartModel.findOne({ userId: userId })
            return res.status(400).send({ status: true, message: 'no parameteres passed', data: cart })
        }
        if (!isValid(userId)) {
            return res.status(400).send({ status: true, message: 'please provide  user id in params' })
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: `${userId} is not a valid user id` })
        }
        if (!isValid(cartId)) {
            return res.status(400).send({ status: true, message: 'cartId is required in the request body' })
        }
        if (!isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: `${cartId} is not a valid cartId id` })
        }
        if (!isValid(productId)) {
            return res.status(400).send({ status: true, message: 'no parameteres passed of the cart data, cart unmodified', data: cartFind })
        }
        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: `${productId} is not a valid productId id` })
        }
        if (!(removeProduct === 0 || removeProduct === 1)) {
            return res.status(400).send({ status: false, message: `removeProduct should be 0 or 1 ` })
        }

        const user = await userModel.findOne({ _id: userId, isDeleted: false });
        if (!user) {
            return res.status(404).send({ status: false, message: `user does not exit` })
        }
        const product = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!product) {
            return res.status(404).send({ status: false, message: `product does not exit` })
        }
        const cartFind = await cartModel.findOne({ _id: cartId, userId: userId })
        if (!cartFind) {
            return res.status(404).send({ status: false, message: `cart does not exit` })
        }
        let array = cartFind.items
        for (let i = 0; i < array.length; i++) {
            if (array[i].productId == productId) {
                let totelProductprice = array[i].quantity * product.price
                if (removeProduct === 0) {
                    const updateProductItem = await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } }, totalPrice: cartFind.totalPrice - totelProductprice, totalItems: cartFind.totalItems - 1 }, { new: true })
                    return res.status(200).send({ status: true, msg: 'sucessfully removed product', data: updateProductItem })
                }
                if (removeProduct === 1) {
                    if (array[i].quantity === 1 && removeProduct === 1) {
                        const removeCart = await cartModel.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } }, totalPrice: cartFind.totalPrice - totelProductprice, totalItems: cartFind.totalItems - 1 }, { new: true })
                        return res.status(200).send({ status: true, msg: 'sucessfully removed product or cart is empty', data: removeCart })
                    }
                    array[i].quantity = array[i].quantity - 1
                    const updateCart = await cartModel.findByIdAndUpdate({ _id: cartId }, { items: array, totalPrice: cartFind.totalPrice - product.price }, { new: true });
                    return res.status(200).send({ status: true, msg: 'sucessfully decress product', data: updateCart })
                }
            }
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, data: error });
    }

}


// --------------------- TWELTH API TO GET CART VALUE -----------------------------------------------------------------------



const getCart = async function (req, res) {

    try {
        const userId = req.params.userId
        const jwtUserId = req.userId

        //    authroization 

        if (!(userId === jwtUserId)) {
            return res.status(400).send({ status: false, msg: "unauthorized access" })
        }

        const checkCart = await cartModel.findOne({ userId: userId })
        if (!checkCart) {
            return res.status(400).send({ status: false, msg: 'cart does not exist ' })
        }
        const checkUser = await userModel.findById(userId)
        if (!checkUser) {
            return res.status(400).send({ status: false, msg: 'user does  does not exist ' })
        }

        res.status(200).send({ status: true, msg: 'sucess', data: checkCart })
    }
    catch (error) {
        res.status(500).send({ status: false, Message: error.message })
    }

}


// ---------------------  THIRTEENTH API TO DELETE CART ITEMS IN CART AND DELETE THE ALL ITEMS  -------------------------------------------------



const deleteCart = async function (req, res) {
    try {
        const userId = req.params.userId
        const jwtUserId = req.userId

        //    authroization  to check the uer i or the jwt user id is match or not

        if (!(userId === jwtUserId)) {
            return res.status(400).send({ status: false, msg: "unauthorized access" })
        }

        const checkCart = await cartModel.findOne({ userId: userId })
        if (!checkCart) {
            return res.status(400).send({ status: false, msg: 'cart does not exist ' })
        }
        const checkUser = await userModel.findById(userId)
        if (!checkUser) {
            return res.status(400).send({ status: false, msg: 'user does  does not exist ' })
        }
        const deleteCart = await cartModel.findOneAndUpdate({ userId: userId }, { items: [], totalPrice: 0, totalItems: 0 }, { new: true })
        res.status(200).send({ status: true, msg: 'sucessfully deleted ', data: deleteCart })
    }
    catch (error) {
        res.status(500).send({ status: false, Message: error.message })
    }
}


// --------------------------------------------------------- ---------------------- -------------------------------------------



module.exports.createCart = createCart
module.exports.updateCart = updateCart
module.exports.getCart = getCart
module.exports.deleteCart = deleteCart