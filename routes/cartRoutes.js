// const express = require('express');
// const cartController = require('../controllers/cartController');
// // const authController = require('../controllers/authController'); // Assuming you have auth middleware

// const router = express.Router();

// // Protect all routes after this middleware (user must be logged in)
// // router.use(authController);

// // Cart routes
// router.route('/')
//   .get(cartController.getCart)
//   .post(cartController.addToCart)
//   .delete(cartController.clearCart);

// router.route('/count')
//   .get(cartController.getCartCount);

// router.route('/items/:itemId')
//   .patch(cartController.updateCartItem)
//   .delete(cartController.removeFromCart);

// module.exports = router;

// routes/cart.js
// const express = require("express");
// const Cart = require("../models/CartModel");
// const Product = require("../models/ProductModel");
// const router = express.Router();

// // Add to Cart
// router.post("/cart", async (req, res) => {
//   try {
//     const { userId, productId, sellerId, quantity } = req.body;

//     // Fetch product to get current price
//     const product = await Product.findById(productId);
//     if (!product) return res.status(404).json({ message: "Product not found" });

//     let cart = await Cart.findOne({ userId });

//     if (!cart) {
//       cart = new Cart({
//         userId,
//         items: [{ product: productId, seller: sellerId, quantity, price: product.price }]
//       });
//     } else {
//       const itemIndex = cart.items.findIndex(
//         item => item.product.toString() === productId
//       );

//       if (itemIndex > -1) {
//         // If product exists, just update quantity
//         cart.items[itemIndex].quantity += quantity;
//       } else {
//         // Add new item with price snapshot
//         cart.items.push({ product: productId, seller: sellerId, quantity, price: product.price });
//       }
//     }

//     await cart.save();
//     res.json(cart);

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });


// import ss from "../controllers/cartController"
const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/add", authMiddleware, cartController.addToCart);
router.post("/remove", authMiddleware, cartController.removeFromCart);
router.post("/update", authMiddleware, cartController.updateCartItem);
router.post("/clear", authMiddleware, cartController.clearCart);
router.get("/", authMiddleware, cartController.getCart);

module.exports = router;