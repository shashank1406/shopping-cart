const cartModel = require('../model/cartModel')
const userModel = require('../model/userModel')
const prouctModel = require('../model/productModel')



// --------------------- TEHTH API TO CREATE NEW CART AND AD PRODUCT IN CART -------------------------------------------


const createCart = async function (req, res) {

    try {
        const reqBody = req.body
        let userId = req.params.userId
        let productId = req.body.productId
        let quantity = req.body.quantity
        let { items, totalPrice, totalItems } = reqBody
        if (!validate.isValidRequestBody(reqBody)) {
            res.status(400).send({ status: false, message: 'Please provide cart details' });
            return;
        }
        if (!validate.isValid(userId)) {
            res.status(400).send({ status: false, message: "Please provide the userId" });
            return;
        }
        if (!validate.isValidObjectId(userId)) {
            res.status(404).send({ status: false, message: `${userId} is not valid  userId ` });
            return;
        }
        const user = await userModel.findById({ _id: userId });
        if (!user) {
            res.status(400).send({ status: false, message: `user does not exit` })
            return
        }
        if (!validate.isValid(items)) {
            res
                .status(400)
                .send({ status: false, message: "items field is not be empty" });
            return;
        }
        if (!validate.isValid(totalPrice)) {
            res
                .status(400)
                .send({ status: false, message: "total price field is not be empty" });
            return;
        }
        if (!validate.isValid(totalItems)) {
            res
                .status(400)
                .send({ status: false, message: "totalItems field is not be empty" });
            return;
        }
        if (!validate.isValid(items[productId])) {
            res.status(400).send({ status: false, msg: "Please provide productId", });
            return;
        }
        if (!validate.isValidObjectId(productId)) {
            res.status(404).send({ status: false, message: `${productId} is not valid  productId ` });
            return;
        }
        const product = await productModel.findById({ productId });
        let productPrice = product.price
        if (!product) {
            res.status(400).send({ status: false, message: `product does not exit` })
            return
        }
        let cartData = {
            userId, items, totalPrice, totalItems
        };
        let isCartAlreadyExist = await cartModel.find({ userId })
        if (isCartAlreadyExist) {
            items = [...items, { productId: productId, quantity: quantity }];
            isCartAlreadyExist.totalItems = isCartAlreadyExist.totalItems + 1
            totalPrice = totalPrice + productPrice
        }
        if (!isCartAlreadyExist) {
            const saveCart = await cartModel.create(cartData)
            return res.status(201).send({ status: true, message: 'Successfully created new cart', data: saveCart })
        }
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }

}


// --------------------- ELEVENTH API TO UPDATE CART   ------------------------------------------------------------------------



const updateCart = async function (req, res) {



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