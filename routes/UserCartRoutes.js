// const express = require('express');
// const router = express.Router();
// const UserCartController = require('../controllers/UserCartController');
// const authMiddleware = require('../middleware/authMiddleware'); // Your auth middleware

// // Apply auth middleware to all cart routes
// router.use(authMiddleware);

// // Cart routes
// router.get('/', UserCartController.getCart);
// router.get('/count', UserCartController.getCartCount);
// router.post('/add', UserCartController.addToCart);
// router.put('/update/:itemId', UserCartController.updateCartItem);
// router.delete('/remove/:itemId', UserCartController.removeFromCart);
// router.delete('/clear', UserCartController.clearCart);

// module.exports = router;

// const express = require('express');
// const userCartController = require('../controllers/UserCartController');

// const router = express.Router();

// // Cart routes
// router.post('/add', userCartController.addToCart); // Add item to cart
// router.get('/', userCartController.getCart); // Get cart
// router.put('/update/:itemId', userCartController.updateCartItem); // Update item quantity
// router.delete('/remove/:itemId', userCartController.removeFromCart); // Remove item
// router.delete('/clear', userCartController.clearCart); // Clear cart
// router.get('/count', userCartController.getCartCount); // Get cart count

// module.exports = router;
const express = require('express');
const userCartController = require('../controllers/UserCartController');
const UserauthMiddleware = require('../middleware/UserAuthMiddleWare'); // Import the middleware

const router = express.Router();

// Apply auth middleware to all cart routes
router.use(UserauthMiddleware);

// Cart routes
router.post('/add', userCartController.addToCart); // Add item to cart
router.get('/', userCartController.getCart); // Get cart
router.put('/update/:itemId', userCartController.updateCartItem); // Update item quantity
router.delete('/remove/:itemId', userCartController.removeFromCart); // Remove item
router.delete('/clear', userCartController.clearCart); // Clear cart
router.get('/count', userCartController.getCartCount); // Get cart count

module.exports = router;