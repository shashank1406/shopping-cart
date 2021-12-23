const jwt = require('jsonwebtoken')

const auth = async function(req,res,next){
    try {
        let token = req.headers['user-login'] 

        if (!token) {

            return res.status(400).send({ status: false, message: 'You are not logged in, Please login to proceed your request' })

        }
        let decodedToken = jwt.verify(token, "Group4")

        if (decodedToken) {
            req.userId = decodedToken.userId
            next();
        } else {
            return res.status(400).send({ status: false, message: 'Invalid Token' })
        }

    } catch (error) {

        return res.status(500).send({ status: false, msg: error.message })
        
        }
}

module.exports.auth = auth


