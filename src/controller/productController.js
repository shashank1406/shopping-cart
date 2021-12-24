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

}

// ======================= sixth api ==============================================================================================//


const getProductBYQuery = async function(req,res){
    
}

// ======================= seventh api ==========================================================================================//


const getProductById = async function(req,res){
    
}

// ======================= eight api ==============================================================================================//


const updateProductById = async function(req,res){
    
}

// ======================= ninth  api ================================================================================================//


const deleteProductById = async function(req,res){
    
}

// ===================================================================================================================================//

module.exports.createProduct = createProduct
module.exports.getProductBYQuery = getProductBYQuery
module.exports.getProductById = getProductById
module.exports.updateProductById = updateProductById
module.exports.deleteProductById = deleteProductById