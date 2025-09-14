const express = require('express');
const { createUserOrder, getUserOrders, getUserOrderById } = require('../controllers/UserOrderController'); // Adjust path
const userauthMiddleware = require('../middleware/UserAuthMiddleWare'); // Adjust if you have auth middleware

const router = express.Router();

// Create a new order (protected)
router.post('/userorders', userauthMiddleware, createUserOrder);

// Get all user orders (protected)
router.get('/userorders', userauthMiddleware, getUserOrders);

// Get single order by ID (protected)
router.get('/userorders/:id', userauthMiddleware, getUserOrderById);

module.exports = router;