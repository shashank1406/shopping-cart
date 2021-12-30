const productModel = require('../model/productModel')

const { uploadFile } = require('./awsController')

const bcrypt = require('bcrypt')

const validator = require('validator')

//-------------------------------validation functions-----------------------


const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (value === 0) return false
    return true;
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidPassword = function (password) {
    if (password.length > 7 && password.length < 16)
        return true
}

const isValidfiles = function (files) {
    if (files && files.length > 0)
        return true
}



// ====================== five api ===============================================================================================//


const createProduct = async function (req, res) {

    try {

        const requestBody = JSON.parse(req.body.data)
        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, Message: "Invalid request parameters, Please provide user details" })
            return
        }
        const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = requestBody
        const files = req.files
        let availableSizesNewArray = []
        if (!isValidfiles(files)) {
            res.status(400).send({ status: false, Message: "Please provide product's image" })
            return
        }
        if (!isValid(title)) {
            res.status(400).send({ status: false, Message: "Please provide product's title" })
            return
        }
        if (!isValid(description)) {
            res.status(400).send({ status: false, Message: "Please provide product's description" })
            return
        }
        if (!isValid(price)) {
            res.status(400).send({ status: false, Message: "Please provide product's price" })
            return
        }
        if (!isValid(currencyId)) {
            res.status(400).send({ status: false, Message: "Please provide currencyId" })
            return
        }
        if (!isValid(currencyFormat)) {
            res.status(400).send({ status: false, Message: "Please provide currency Format" })
            return
        }
        if (!isValid(style)) {
            res.status(400).send({ status: false, Message: "Please provide product's style" })
            return
        }
        if (availableSizes) {
            if (availableSizes.length === 0) {
                return res.status(400).send({ status: false, msg: 'please provide the product size' })
            }
            for (let i = 0; i < availableSizes.length; i++) {
                availableSizesNewArray.push(availableSizes[i].toUpperCase())
                if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(availableSizes[i]))) {
                    return res.status(400).send({ status: false, message: `please provide available size from  ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` })
                }

            }
        }
        // ================= unique validation =====================

        const isTitleAlreadyUsed = await productModel.findOne({ title: title });

        if (isTitleAlreadyUsed) {
            res.status(400).send({ status: false, message: `${title} title  is already exist` })
            return
        }

        // ================= validation ends ============================

        const productImage = await uploadFile(files[0])
        const productData = {
            title: title,
            description: description,
            price: price,
            currencyId: currencyId,
            currencyFormat: currencyFormat,
            isFreeShipping: isFreeShipping,
            style: style,
            availableSizes: availableSizesNewArray,
            installments: installments,
            productImage: productImage
        }
        const newProduct = await productModel.create(productData)

        res.status(201).send({ status: true, message: "product created sucessfully", data: newProduct });
    }
    catch (err) {
        res.status(500).send({ status: false, Message: err.message })
    }

}

// ======================= sixth api ==============================================================================================//


const getProductBYQuery = async function (req, res) {

    try {
        if (req.query.size || req.query.name || req.query.priceGreaterThan || req.query.priceLessThan) {
            let availableSizes = req.query.size
            let title = req.query.name
            let priceGreaterThan = req.query.priceGreaterThan
            let priceLessThan = req.query.priceLessThan
            obj = {}
            if (availableSizes) {
                obj.availableSizes = availableSizes
            }
            if (title) {
                obj.title = { $regex: title, $options: " " }
            }
            if (priceGreaterThan) {
                obj.price = { $gt: priceGreaterThan }
            }
            if (priceLessThan) {
                obj.price = { $lt: priceLessThan }
            }
            obj.isDeleted = false
            obj.deletedAt = null

            const getProductsList = await productModel.find(obj).sort({ price: 1 })

            if (!getProductsList || getProductsList.length == 0) {
                res.status(400).send({ status: false, message: `product is not available right now.` })
            } else {
                res.status(200).send({ status: true, message: 'Success', data: getProductsList })
            }
        } else {
            const getListOfProducts = await productModel.find({ isDeleted: false, deletedAt: null }).sort({ price: 1 })
            res.status(200).send({ status: true, message: 'Success', data: getListOfProducts })
        }
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }

}

// ======================= seventh api ==========================================================================================//


const getProductById = async function (req, res) {
    try {
        let productId = req.params.productId
        const searchProduct = await productModel.findById(productId)
        if (!searchProduct) {
            return res.status(400).send({ status: false, msg: 'product does not exist with this prouct id or incorrect product id' })
        }
        res.status(200).send({ status: true, msg: 'sucess', data: searchProduct })
    }
    catch (err) {
        res.status(500).send({ status: false, Message: err.message })
    }
}

// ======================= eight api ==============================================================================================//


const updateProductById = async function (req, res) {
    try {
        const requestBody = JSON.parse(req.body.data);
        const productId = req.params.productId
        const checkProductId = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!checkProductId) {
            return res.status(404).send({ status: false, msg: 'please provide valid product id ' })
        }
        const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = requestBody;

        const updateProductInfo = {}

        const files = req.files

        if (isValidfiles(files)) {
            const ProfilePicture = await uploadFile(files[0])
            updateProductInfo.profileImage = ProfilePicture
        }
        if (isValid(title)) {
            const isTitleAlreadyUsed = await productModel.findOne({ title: title });
            if (isTitleAlreadyUsed) {
                return res.status(400).send({ status: false, msg: `${title} already exist ` })
            }
            updateProductInfo.title = title
        }
        if (isValid(description)) {
            updateProductInfo.description = description
        }

        if (isValid(price)) {
            updateProductInfo.price = price
        }

        if (isValid(currencyId)) {
            updateProductInfo.currencyId = currencyId
        }

        if (isValid(isFreeShipping)) {
            updateProductInfo.isFreeShipping = isFreeShipping
        }

        if (isValid(currencyFormat)) {
            updateProductInfo.currencyFormat = currencyFormat
        }

        if (isValid(style)) {
            updateProductInfo.style = style
        }
        if (availableSizes) {

            if (availableSizes.length === 0) {
                return res.status(400).send({ status: false, msg: 'please provide the product size' })
            }
            let array = []
            for (let i = 0; i < availableSizes.length; i++) {
                array.push(availableSizes[i].toUpperCase())
                if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(array[i]))) {
                    return res.status(400).send({ status: false, message: `please provide available size from  ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` })
                }
            }
            updateProductInfo.$addToSet = { availableSizes: array }
        }
        if (isValid(installments)) {
            updateProductInfo.installments = installments
        }
        const updatedProduct = await productModel.findOneAndUpdate({ _id: productId }, updateProductInfo, { new: true })

        return res.status(200).send({ status: true, message: 'Success', data: updatedProduct });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }

}

// ======================= ninth  api ================================================================================================//

const deleteProductById = async function (req, res) {
    try {
        let productId = req.params.productId
        const searchProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!searchProduct) {
            return res.status(400).send({ status: false, msg: 'product does not exist with this prouct id or already deleted' })
        }
        const result = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { isDeleted: true, deletedAt: new Date() }, { new: true })
        res.status(200).send({ status: true, msg: 'successfully deleted', data: result })
    }
    catch (err) {
        res.status(500).send({ status: false, Message: err.message })
    }

}

// ===================================================================================================================================//

module.exports.createProduct = createProduct
module.exports.getProductBYQuery = getProductBYQuery
module.exports.getProductById = getProductById
module.exports.updateProductById = updateProductById
module.exports.deleteProductById = deleteProductById