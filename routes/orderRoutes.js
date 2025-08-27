const express = require('express');
const router = express.Router();
const { createOrder, getOrders } = require('../controllers/orderController');
const checkAuth = require('../middleware/checkAuth');

router.post('/', checkAuth, createOrder);
router.get('/', checkAuth, getOrders);

module.exports = router;