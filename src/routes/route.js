const express = require('express');

const userController = require('../controller/userController')
const productController = require('../controller/productController')
const cartController = require('../controller/cartController')
const orderController = require('../controller/orderController')
const middleWare = require('../middleware/authentication')



const router = express.Router();


//  first feature apis

router.post("/register", userController.createUser);

router.post("/login", userController.doLogin);

router.get("/user/:userId/profile", middleWare.auth, userController.getuserById);

router.put("/user/:userId/profile", middleWare.auth, userController.updateUser);

// second feature apis 

router.post("/products", productController.createProduct);

router.get("/products", productController.getProductBYQuery);

router.get("/products/:productId", productController.getProductById);

router.put("/products/:productId", productController.updateProductById);

router.delete("/products/:productId", productController.deleteProductById);

// third featur apis 

router.post("/users/:userId/cart", middleWare.auth, cartController.createCart);

router.put("/users/:userId/cart", middleWare.auth, cartController.updateCart);

router.get("/users/:userId/cart", middleWare.auth, cartController.getCart);

router.delete("/users/:userId/cart", middleWare.auth, cartController.deleteCart);

// fourth feature apis

router.post("/users/:userId/orders", middleWare.auth, orderController.createOrder);

router.put("/users/:userId/orders", middleWare.auth, orderController.updateOrderDetail);


module.exports = router;


