const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/WishlistController');
const authMiddleware = require('../middleware/authMiddleware'); // Your auth middleware

// Apply authentication middleware to all wishlist routes
router.use(authMiddleware);

// GET /api/wishlist - Get user's wishlist
router.get('/', wishlistController.getWishlist);

// POST /api/wishlist/add - Add product to wishlist
router.post('/add', wishlistController.addToWishlist);

// POST /api/wishlist/remove - Remove product from wishlist
router.post('/remove', wishlistController.removeFromWishlist);

// POST /api/wishlist/toggle - Toggle product in wishlist (add/remove)
router.post('/toggle', wishlistController.toggleWishlist);

// POST /api/wishlist/clear - Clear entire wishlist
router.post('/clear', wishlistController.clearWishlist);

// GET /api/wishlist/check/:productId - Check if product is in wishlist
router.get('/check/:productId', wishlistController.checkWishlist);

module.exports = router;