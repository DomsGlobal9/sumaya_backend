const express = require('express');
const router = express.Router();
const CommissionTracking = require('../models/CommissionModel');
const Seller = require('../models/Seller');
const Product = require('../models/ProductModel');
const checkAuth = require('../middleware/checkAuth');

// Track referral visit
router.post('/referral-visit', async (req, res) => {
  try {
    const { referralSellerId, productId, visitorIP, userAgent } = req.body;

    if (!referralSellerId || !productId) {
      return res.status(400).json({ 
        message: 'Referral seller ID and product ID are required' 
      });
    }

    const tracking = await CommissionTracking.trackReferralVisit({
      referralSellerId,
      productId,
      visitorIP: visitorIP || 'unknown',
      userAgent: userAgent || 'unknown'
    });

    res.status(200).json({
      message: 'Referral visit tracked successfully',
      trackingId: tracking._id
    });

  } catch (error) {
    console.error('Error tracking referral visit:', error);
    res.status(500).json({ 
      message: 'Error tracking referral visit',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Track referral purchase (called when order is completed)
router.post('/referral-purchase', async (req, res) => {
  try {
    const { orderId, customerId, visitorIP } = req.body;

    if (!orderId || !customerId) {
      return res.status(400).json({ 
        message: 'Order ID and customer ID are required' 
      });
    }

    const trackings = await CommissionTracking.trackReferralPurchase({
      orderId,
      customerId,
      visitorIP: visitorIP || 'unknown'
    });

    res.status(200).json({
      message: 'Referral purchases tracked successfully',
      commissionsTracked: trackings.length,
      trackings: trackings.map(t => ({
        id: t._id,
        sellerId: t.referralSellerId,
        commission: t.commissionAmount
      }))
    });

  } catch (error) {
    console.error('Error tracking referral purchase:', error);
    res.status(500).json({ 
      message: 'Error tracking referral purchase',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get seller's commission summary
router.get('/seller/:sellerId/commission-summary', checkAuth, async (req, res) => {
  try {
    const { sellerId } = req.params;

    // Ensure user can only access their own commission data
    if (req.user.id !== sellerId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const summary = await CommissionTracking.getSellerCommissionSummary(sellerId);

    res.status(200).json({
      message: 'Commission summary retrieved successfully',
      summary
    });

  } catch (error) {
    console.error('Error getting commission summary:', error);
    res.status(500).json({ 
      message: 'Error getting commission summary',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get detailed commission history for a seller
router.get('/seller/:sellerId/commission-history', checkAuth, async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { page = 1, limit = 20, status } = req.query;

    // Ensure user can only access their own commission data
    if (req.user.id !== sellerId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const query = { referralSellerId: sellerId };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [commissions, total] = await Promise.all([
      CommissionTracking.find(query)
        .populate('productId', 'name images salePrice')
        .populate('customerId', 'username email')
        .populate('orderId', 'orderNumber total status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      CommissionTracking.countDocuments(query)
    ]);

    res.status(200).json({
      message: 'Commission history retrieved successfully',
      commissions,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + commissions.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error getting commission history:', error);
    res.status(500).json({ 
      message: 'Error getting commission history',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Admin route to mark commission as paid
router.post('/admin/mark-paid/:trackingId', checkAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { trackingId } = req.params;
    const { paymentMethod, transactionId } = req.body;

    const tracking = await CommissionTracking.findById(trackingId);
    if (!tracking) {
      return res.status(404).json({ message: 'Commission tracking not found' });
    }

    await tracking.markAsPaid({ paymentMethod, transactionId });

    res.status(200).json({
      message: 'Commission marked as paid successfully',
      tracking
    });

  } catch (error) {
    console.error('Error marking commission as paid:', error);
    res.status(500).json({ 
      message: 'Error marking commission as paid',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;