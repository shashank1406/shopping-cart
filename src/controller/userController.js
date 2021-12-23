const userModel = require('../model/userModel');
const aws = require('aws-sdk')
const bcrypt = require('bcrypt')
const validator =require('validator')
let saltRounds=10

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
    if (files && files.length>0)
        return true
}

//--------------------------------AWS Configuration-------------------------------------

aws.config.update({
    accessKeyId: "AKIAY3L35MCRRMC6253G",
    secretAccessKey: "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",
    region: "ap-south-1",
})

//--------------------------------AWS file upload--------------------------

const uploadFile = async function (file, name) {
    return new Promise(function (resolve, reject) {
        // Create S3 service object
        const s3 = new aws.S3({ apiVersion: "2006-03-01" })
        const uploadParams = {
            ACL: "public-read", /// this file is accesible publically..permission
            Bucket: "classroom-training-bucket", // HERE
            Key: name + "/" + file.originalname, // HERE
            Body: file.buffer,
        }
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }
            console.log(data)
            console.log(`File uploaded successfully. ${data.Location}`)
            return resolve(data.Location) //HERE 
        })
    })
}
//------------------------first api to create user-------------------------------------------------

const createUser = async function (req, res) {
    try {

        const requestBody = req.body

        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, Message: "Invalid request parameters, Please provide user details" })
            return
        }
        const  files = req.files
        const fname = requestBody.fname
        const lname = requestBody.lname
        const email = requestBody.email
        const phone = requestBody.phone
        const password = requestBody.password
        const address = requestBody.address
    

        if (!isValid(fname)) {
            res.status(400).send({ status: false, Message: "Please provide user's first name" })
            return
        }
        if (!isValid(lname)) {
            res.status(400).send({ status: false, Message: "Please provide user's last name" })
            return
        }

        if (!isValidfiles(files)) {
            res.status(400).send({ status: false, Message: "Please provide user's profile picture" })
            return
        }

        if (!isValid(email)) {
            res.status(400).send({ status: false, Message: "Please provide user's email" })
            return
        }

        if (!isValid(phone)) {
            res.status(400).send({ status: false, Message: "Please provide a vaild phone number" })
            return
        }

        if (!isValid(password)) {
            res.status(400).send({ status: false, Message: "Please provide password" })
            return
        }

      

        
        //---------shipping address validation

        if (!isValid(address.shipping.street)) {
            res.status(400).send({ status: false, Message: "Please provide street name in shipping address" })
            return
        }
        if (!isValid(address.shipping.city)) {
            res.status(400).send({ status: false, Message: "Please provide city name in shipping address" })
            return
        }
        if (!isValid(address.shipping.pincode)) {
            res.status(400).send({ status: false, Message: "Please provide pincode in shipping address" })
            return
        }

        // //---------billing address validation

      
        if (!isValid(address.billing.street)) {
            res.status(400).send({ status: false, Message: "Please provide street name in billing address" })
            return
        }
        if (!isValid(address.billing.city)) {
            res.status(400).send({ status: false, Message: "Please provide city name in billing address" })
            return
        }
        if (!isValid(address.billing.pincode)) {
            res.status(400).send({ status: false, Message: "Please provide pincode in billing address" })
            return
        }

        // //-----------------------------email and phone  and password validationvalidation-----------------------------
        
       
        if (!(validator.isEmail(email.trim()))) {   
            return res.status(400).send({ status: false, msg: 'enter valid email' })
        }

        if (!(/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/.test(phone))) {
            res.status(400).send({ status: false, message: `phone no should be a valid phone no` })
            return
        }
        if (!isValidPassword(password)) {
            res.status(400).send({ status: false, Message: "Please provide a vaild password ,Password should be of 8 - 15 characters" })
            return
        }

       
       
        // //-----------------------------------unique validation -------------------------------------
       
        let Email = email.split(' ').join('')

        const isEmailAlreadyUsed = await userModel.findOne({ email: Email }); 

        if (isEmailAlreadyUsed) {
            res.status(400).send({ status: false, message: `${Email} email address is already registered` })
            return
        }

        const isPhoneAlreadyUsed = await userModel.findOne({ phone: phone });

        if (isPhoneAlreadyUsed) {
            res.status(400).send({ status: false, message: `${phone}  phone is already registered` })
            return
        }
        
    //--------------------validation ends -----------------------

   const profilePicture = await uploadFile(files[0], 'user')

    const encryptedPassword =await bcrypt.hash(password, saltRounds)

    let FEmail = email.split(' ').join('')
    
    const userData = { fname:fname , lname:lname , profileImage:profilePicture ,  email: FEmail, 
                        phone, password:encryptedPassword , address : address }

    const newUser = await userModel.create(userData);

    res.status(201).send({ status: true, message: `User registered successfully`, data: newUser });

    }
    catch (error) {
        res.status(500).send({ status: false, Message: error.message })
    }
}

// ============================ second login api ======================================================

const doLogin = async function (req, res) {
    try {

        let requestBody = req.body

        // request body validation 

        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide login details' })
            return
        }

        if (requestBody.email && requestBody.password) {

            // email id or password is velid or not check validation 

            let userEmail = await userModels.findOne({ email: requestBody.email });

            if (!userEmail) {
                return res.status(400).send({ status: true, msg: "Invalid user email" })
            }

            const encryptedPassword =await bcrypt.hash(password, saltRounds)

            let userPassword = await userModels.findOne({ password: encryptedPassword });

            if (!userPassword) {
                return res.status(400).send({ status: true, msg: "Invalid user password" })
            }

            // jwt token create and send back the user
            let payload = { _id: userEmail._id }

            let generatedToken = jwt.sign(payload, 'Group4', { expiresIn: '60m' })

            res.header('x-api-key', generatedToken);

            res.status(200).send({ status: true, data: " user  login successfull",userId: userEmail._id, token: { generatedToken } })

        } else {

            res.status(400).send({ status: false, msg: "must contain email and password" })
        }
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
    }
};



const getuserById = async (req, res) => {
    try {
        const userId = req.params.userId
        const searchprofile = await userModel.findOne({ _id: userId, isDeleted: false })
        if (!searchprofile) {
            return res.status(404).send({ status: false, message: 'profile does not exist' })
        }
        const Data = await userModel.find({ userId: userId, isDeleted: false })
        return res.status(200).send({ status: true, message: 'user profile details', data: Data })
    } catch (error) {
        return res.status(500).send({ success: false, error: error.message });
    }
}


const updateUser = async function (req, res) {
    try {
        const userId = req.params.userId
        const requestBody = req.body
        if (!Object.keys(requestBody).length > 0) {
            return res.status(200).send({ status: true, message: 'No param received, user details unmodified' })
        }
        if (!ObjectId.isValid(userId)) {
            return res.status(400).send({ status: false, message: `${userId} is not a valid user id` })
        }
        const user = await UserModel.findById(userId)
        if (!user) {
            return res.status(404).send({ status: false, message: "User not found" })
        }
        // Extract parameters
        let { fname, lname, email, phone, password, addressStr, files } = requestBody;    //destrucing
        // valid one by one
        if (!isValid(fname)) {
            res.status(400).send({ status: false, message: 'First name is required' })
            return
        }
        if (!isValid(lname)) {
            res.status(400).send({ status: false, message: 'Last name is required' })
            return
        }
        if (files && files.length > 0) { // condition
            const profileImage = await uploadFile(files[0], 'user')
            if (profileImage) {
                return res.status(400).send({ status: false, message: `${profileImage} already is present` })
            }
            if (email) {
                if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) { // regex is used here
                    res.status(400).send({ status: false, message: `Email should be a valid email address` })
                    return
                }
                const isEmailAlreadyUsed = await UserModel.findOne({ email: email, _id: userId });
                if (isEmailAlreadyUsed) {
                    return res.status(400).send({ status: false, message: `${email} email address is already present` })
                }
            }
            if (phone) {
                if (!/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone)) { // regex used for number
                    return res.status(400).send({ status: false, message: `phone should be a valid number` });
                }
                const isPhoneAlreadyUsed = await UserModel.findOne({ phone: phone, _id: userId });
                if (isPhoneAlreadyUsed) {
                    return res.status(400).send({ status: false, message: `${phone} phone number is already registered` })
                }
            }
            if (password) {
                if (!(password.length >= 8 && password.length <= 15)) { // condition apply assignment operator and logical
                    return res.status(400).send({ status: false, message: "Password should be Valid min 8 and max 15 " })
                }
                const encryptedPassword = await bcrypt.hash(password, saltRounds);  // encryption handaled
                if (encryptedPassword) {
                    return res.status(400).send({ status: false, message: `${encryptedPassword} password is present` })
                }
            }
            const address = JSON.parse(addressStr)
            if (!address.shipping || (address.shipping && (!address.shipping.street || !address.shipping.city || !address.shipping.pincode))) {
                return res.status(400).send({ status: false, message: 'Shipping address is required' })
            }
            if (!address.billing || (address.billing && (!address.billing.street || !address.billing.city || !address.billing.pincode))) {
                return res.status(400).send({ status: false, message: 'Billing address is required' })
            }
        }
        // complete update
        const adressUpdate = JSON.parse(UserUpdate)
        const updatedUser = await user.save()
        const UserUpdate = JSON.stringify(updatedUser); // converts a JavaScript object or value to a json string.
        delete (adressUpdate.password)
        return res.status(200).send({ status: true, message: 'User profile updated', data: adressUpdate })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports.createUser = createUser
module.exports.doLogin = doLogin
module.exports.getuserById = getuserById
module.exports.updateUser = updateUser