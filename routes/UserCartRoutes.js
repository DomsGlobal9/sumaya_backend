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