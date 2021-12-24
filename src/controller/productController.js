const productModel = require('../model/productModel')

const {uploadFile} = require('./awsController')

const bcrypt = require('bcrypt')

const validator = require('validator')



//-------------------------------validation functions-----------------------


const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
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

const isValidTitle = function (title) {   
    return ['Mr', 'Mrs', 'Miss'].indexOf(title) !== -1
}



// ====================== five api ===============================================================================================//


const createProduct = async function(req,res){

    try {

        const requestBody = JSON.parse(req.body.data)

        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, Message: "Invalid request parameters, Please provide user details" })
            return
        }

        const{title,description,price,currencyId,currencyFormat,isFreeShipping,style,availableSizes,installments}= requestBody
      

        const files = req.files

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

        if (!isValid(isFreeShipping)) {
            res.status(400).send({ status: false, Message: "Please provide isShipping status , true/false" })
            return
        }

        if (!isValid(style)) {
            res.status(400).send({ status: false, Message: "Please provide product's style" })
            return
        }

        // if (!isValidAvailableSizes(availableSizes)) {
        //     res.status(400).send({ status: false, Message: "Please provide a valid size" })
        //     return
        // }

        if (!isValid(installments)) {
            res.status(400).send({ status: false, Message: "Please provide installment" })
            return
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
            title : title,
            description : description,
            price : price,
            currencyId : currencyId,
            currencyFormat : currencyFormat,
            isFreeShipping : isFreeShipping,
            style : style,
            availableSizes : availableSizes,
            installments : installments,
            productImage : productImage
        }

        const newProduct = await productModel.create(productData)

        res.status(201).send({ status: true, message: "product created sucessfully", data: newProduct });
    }
    catch (err) {
        res.status(500).send({ status: false, Message: err.message })
    }

}

// ======================= sixth api ==============================================================================================//


const getProductBYQuery = async function(req,res){
    
}

// ======================= seventh api ==========================================================================================//


const getProductById = async function(req,res){
    
    try{
        let productId = req.parama.productId
        const searchProduct = await productModel.findById(productId)
        if(!searchProduct){
            return res.status(400).send({status:false,msg:'product does not exist with this prouct id or incorrect product id'})
        }
        res.status(200).send({status:true,msg:'sucess',data:searchProduct})

    }
    catch (err) {
        res.status(500).send({ status: false, Message: err.message })
    }
}

// ======================= eight api ==============================================================================================//


const updateProductById = async function(req,res){
    
}

// ======================= ninth  api ================================================================================================//


const deleteProductById = async function(req,res){
    
    try{
        let productId = req.parama.productId
        const searchProduct = await productModel.findOne({_id:productId,isDeleted:false})
        if(!searchProduct){
            return res.status(400).send({status:false,msg:'product does not exist with this prouct id or already deleted'})
        }
        const result = await productModel.findOneAndUpdate({_id:productId,isDeleted:false},{isDeleted:true},{new:true})
        res.status(200).send({status:true,msg:'sucefullt deleted',data:result})

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