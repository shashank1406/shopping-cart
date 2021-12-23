const express = require('express');

const userController = require('../controller/userController')
const middleWare = require('../middleware/authentication')


const router = express.Router();

router.post("/register", userController.createUser);

router.post("/login", userController.doLogin);

router.get("/user/:userId/profile",middleWare.auth, userController.getuserById);

router.put("/user/:userId/profile",middleWare.auth, userController.updateUser);

module.exports = router;

