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