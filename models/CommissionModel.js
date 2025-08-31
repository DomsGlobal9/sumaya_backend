const mongoose = require("mongoose");

const commissionTrackingSchema = new mongoose.Schema({
  referralSellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  commissionAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'paid', 'cancelled'],
    default: 'pending'
  },
  visitData: {
    visitorIP: String,
    userAgent: String,
    visitedAt: {
      type: Date,
      default: Date.now
    }
  },
  purchaseData: {
    purchasedAt: Date,
    orderTotal: Number,
    commissionRate: {
      type: Number,
      min: 0,
      max: 100 // percentage
    }
  },
  paymentData: {
    paidAt: Date,
    paymentMethod: String,
    transactionId: String
  }
}, { 
  timestamps: true,
  indexes: [
    { referralSellerId: 1, status: 1 },
    { productId: 1 },
    { customerId: 1 },
    { orderId: 1, status: 1 },
    { 'visitData.visitedAt': 1 },
    { 'purchaseData.purchasedAt': 1 }
  ]
});

// Static method to track a referral visit - Updated for your Product model
commissionTrackingSchema.statics.trackReferralVisit = async function(data) {
  const { referralSellerId, productId, visitorIP, userAgent } = data;
  
  try {
    // Get product details for commission amount - using your Product schema
    const Product = mongoose.model('Product');
    const product = await Product.findById(productId);
    
    if (!product || !product.isActive) {
      throw new Error('Product not found or inactive');
    }

    // Check if this IP has visited this product from this seller recently (within 24 hours)
    const recentVisit = await this.findOne({
      referralSellerId,
      productId,
      'visitData.visitorIP': visitorIP,
      'visitData.visitedAt': { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      status: 'pending'
    });

    if (recentVisit) {
      // Update existing visit
      recentVisit.visitData.visitedAt = new Date();
      return await recentVisit.save();
    }

    // Create new tracking record using your product's commission field
    const tracking = new this({
      referralSellerId,
      productId,
      commissionAmount: product.sellerCommission || 0, // Using your sellerCommission field
      visitData: {
        visitorIP,
        userAgent,
        visitedAt: new Date()
      }
    });

    return await tracking.save();
  } catch (error) {
    console.error('Error tracking referral visit:', error);
    throw error;
  }
};

// Static method to convert visit to purchase - Updated for your Order model
commissionTrackingSchema.statics.trackReferralPurchase = async function(data) {
  const { orderId, customerId, visitorIP } = data;
  
  try {
    const Order = mongoose.model('Order');
    const order = await Order.findById(orderId).populate('items.productId');
    
    if (!order || order.status !== 'pending') {
      throw new Error('Order not found or not in correct status');
    }

    const results = [];
    
    // Process each item in the order - matching your Order schema
    for (const item of order.items) {
      // Find matching referral tracking within last 30 days
      const tracking = await this.findOne({
        productId: item.productId._id,
        'visitData.visitorIP': visitorIP,
        'visitData.visitedAt': { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        status: 'pending'
      }).sort({ 'visitData.visitedAt': -1 }); // Get most recent visit

      if (tracking) {
        // Update tracking with purchase data using your Order model structure
        tracking.customerId = customerId;
        tracking.orderId = orderId;
        tracking.status = 'confirmed';
        tracking.purchaseData = {
          purchasedAt: new Date(),
          orderTotal: item.price * item.quantity, // Using your price field
          commissionRate: (tracking.commissionAmount / item.price) * 100
        };
        
        const updatedTracking = await tracking.save();
        results.push(updatedTracking);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error tracking referral purchase:', error);
    throw error;
  }
};

// Instance method to mark commission as paid
commissionTrackingSchema.methods.markAsPaid = async function(paymentData) {
  this.status = 'paid';
  this.paymentData = {
    paidAt: new Date(),
    paymentMethod: paymentData.paymentMethod,
    transactionId: paymentData.transactionId
  };
  return await this.save();
};

// Static method to get seller commission summary
commissionTrackingSchema.statics.getSellerCommissionSummary = async function(sellerId) {
  try {
    const summary = await this.aggregate([
      { $match: { referralSellerId: new mongoose.Types.ObjectId(sellerId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$commissionAmount' }
        }
      }
    ]);

    const result = {
      pending: { count: 0, total: 0 },
      confirmed: { count: 0, total: 0 },
      paid: { count: 0, total: 0 },
      cancelled: { count: 0, total: 0 }
    };

    summary.forEach(item => {
      result[item._id] = {
        count: item.count,
        total: item.totalAmount
      };
    });

    return result;
  } catch (error) {
    console.error('Error getting seller commission summary:', error);
    throw error;
  }
};

module.exports = mongoose.model("CommissionTracking", commissionTrackingSchema);