const express = require('express');
const router = express.Router();
const { createOrder, getOrders } = require('../controllers/orderController');
const Order = require('../models/Order');
const CommissionTracking = require('../models/CommissionModel');
const checkAuth = require('../middleware/checkAuth');

router.post('/', checkAuth, createOrder);
router.get('/', checkAuth, getOrders);

// Add this to your existing orderRoutes.js or create if it doesn't exist

// Create order (existing route - update to track referrals)
router.post('/create', checkAuth, async (req, res) => {
  try {
    const { items, shippingInfo, totalAmount, paymentMethod, visitorIP } = req.body;
    
    // Generate order number
    const orderNumber = 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    
    const order = new Order({
      userId: req.user.id,
      items,
      shippingInfo,
      totalAmount,
      paymentMethod,
      orderNumber,
      status: 'pending'
    });

    await order.save();
    await order.populate('items.productId');

    // Track commission if this was a referral purchase
    try {
      const commissionTrackings = await CommissionTracking.trackReferralPurchase({
        orderId: order._id,
        customerId: req.user.id,
        visitorIP: visitorIP || req.ip || 'unknown'
      });
      
      if (commissionTrackings.length > 0) {
        console.log(`Tracked ${commissionTrackings.length} commission entries for order ${orderNumber}`);
      }
    } catch (error) {
      console.log('Commission tracking failed (non-critical):', error.message);
    }

    res.status(201).json({
      message: 'Order created successfully',
      order
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      message: 'Error creating order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update order status (for admin/seller)
router.patch('/:orderId/status', checkAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order status
    order.status = status;
    await order.save();

    // If order is completed/delivered, mark commissions as confirmed
    if (status === 'delivered') {
      await CommissionTracking.updateMany(
        { orderId: orderId, status: 'pending' },
        { status: 'confirmed' }
      );
    }

    res.status(200).json({
      message: 'Order status updated successfully',
      order
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      message: 'Error updating order status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get user orders
router.get('/my-orders', checkAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = { userId: req.user.id };
    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('items.productId', 'description images sellingPrice')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query)
    ]);

    res.status(200).json({
      message: 'Orders retrieved successfully',
      orders,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + orders.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({
      message: 'Error getting orders',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});


module.exports = router;