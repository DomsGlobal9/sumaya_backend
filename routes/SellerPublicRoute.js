const express = require('express');
const router = express.Router();
const Seller = require('../models/Seller');
const Product = require('../models/ProductModel');
const Wishlist = require('../models/WishlistModel'); // Assuming you have a wishlist model

// Get seller's public profile (for boutique display)
router.get('/:sellerId/public', async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await Seller.findById(sellerId).select(
      'username shopName logo theme profileComplete createdAt'
    );

    if (!seller) {
      return res.status(404).json({ 
        message: 'Seller not found' 
      });
    }

    // Only show boutique if profile is complete
    if (!seller.profileComplete) {
      return res.status(404).json({ 
        message: 'Boutique not available yet' 
      });
    }

    res.status(200).json({
      message: 'Seller profile retrieved successfully',
      seller: {
        id: seller._id,
        username: seller.username,
        shopName: seller.shopName,
        logo: seller.logo,
        theme: seller.theme,
        memberSince: seller.createdAt
      }
    });

  } catch (error) {
    console.error('Error getting seller public profile:', error);
    res.status(500).json({ 
      message: 'Error getting seller profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get seller's product collection (wishlist products for boutique display)
router.get('/:sellerId/collection', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { page = 1, limit = 20, category, minPrice, maxPrice } = req.query;

    const Wishlist = require('../models/Wishlist');
    const Product = require('../models/Product');

    // Verify seller exists and profile is complete
    const seller = await Seller.findById(sellerId).select('profileComplete');
    if (!seller || !seller.profileComplete) {
      return res.status(404).json({ 
        message: 'Seller collection not available' 
      });
    }

    // Build query for wishlist products - using your model structure
    const wishlistQuery = { userId: sellerId }; // Your model uses userId, not sellerId
    
    // Get wishlist items with populated product details
    let productQuery = {};
    if (category) productQuery.category = category;
    if (minPrice || maxPrice) {
      productQuery.sellingPrice = {}; // Your model uses sellingPrice
      if (minPrice) productQuery.sellingPrice.$gte = parseFloat(minPrice);
      if (maxPrice) productQuery.sellingPrice.$lte = parseFloat(maxPrice);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get wishlist items - matching your schema structure
    const wishlist = await Wishlist.findOne(wishlistQuery)
      .populate({
        path: 'items.productId',
        match: productQuery,
        select: 'articleNumber category description designPattern color availableSizes images sellingPrice sellerCommission displayMRP isActive'
      });

    if (!wishlist) {
      return res.status(200).json({
        message: 'No collection found',
        products: [],
        pagination: { current: 1, total: 0, hasNext: false, hasPrev: false },
        totalProducts: 0
      });
    }

    // Filter out null products and format for frontend
    const products = wishlist.items
      .filter(item => item.productId && item.productId.isActive)
      .slice(skip, skip + parseInt(limit))
      .map(item => ({
        _id: item.productId._id,
        id: item.productId._id,
        name: item.productId.description, // Using description as name
        articleNumber: item.productId.articleNumber,
        category: item.productId.category,
        brand: "Sumaya", // Default brand
        images: item.productId.images.map(img => img.url),
        salePrice: item.productId.sellingPrice,
        originalPrice: item.productId.displayMRP,
        commission: item.productId.sellerCommission,
        color: item.productId.color,
        sizes: item.productId.availableSizes,
        rating: 4.6, // Default rating
        outOfStock: false, // You can add stock management later
        addedAt: item.addedAt
      }));

    const totalWishlistItems = wishlist.items.filter(item => item.productId && item.productId.isActive).length;

    res.status(200).json({
      message: 'Seller collection retrieved successfully',
      products,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(totalWishlistItems / parseInt(limit)),
        hasNext: skip + products.length < totalWishlistItems,
        hasPrev: parseInt(page) > 1
      },
      totalProducts: products.length
    });

  } catch (error) {
    console.error('Error getting seller collection:', error);
    res.status(500).json({ 
      message: 'Error getting seller collection',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get specific product with seller context (for shared product display)
router.get('/:sellerId/product/:productId', async (req, res) => {
  try {
    const { sellerId, productId } = req.params;

    // Verify seller exists
    const seller = await Seller.findById(sellerId).select(
      'username shopName logo theme profileComplete'
    );

    if (!seller || !seller.profileComplete) {
      return res.status(404).json({ 
        message: 'Seller boutique not available' 
      });
    }

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        message: 'Product not found' 
      });
    }

    // Check if product is in seller's wishlist (optional - for verification)
    const isInSellerCollection = await Wishlist.findOne({ 
      sellerId: sellerId, 
      productId: productId 
    });

    res.status(200).json({
      message: 'Product retrieved successfully',
      product,
      seller: {
        id: seller._id,
        username: seller.username,
        shopName: seller.shopName,
        logo: seller.logo,
        theme: seller.theme
      },
      isInSellerCollection: !!isInSellerCollection
    });

  } catch (error) {
    console.error('Error getting seller product:', error);
    res.status(500).json({ 
      message: 'Error getting product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get seller's boutique stats (optional - for display purposes)
router.get('/:sellerId/stats', async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await Seller.findById(sellerId).select('profileComplete');
    if (!seller || !seller.profileComplete) {
      return res.status(404).json({ 
        message: 'Seller not found' 
      });
    }

    // Get collection stats
    const totalProducts = await Wishlist.countDocuments({ sellerId });
    
    // Get categories in seller's collection
    const categoryStats = await Wishlist.aggregate([
      { $match: { sellerId: new mongoose.Types.ObjectId(sellerId) } },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get commission summary (if tracking is implemented)
    const CommissionTracking = require('../models/CommissionTracking');
    let commissionStats = null;
    try {
      commissionStats = await CommissionTracking.getSellerCommissionSummary(sellerId);
    } catch (error) {
      console.log('Commission tracking not available:', error.message);
    }

    res.status(200).json({
      message: 'Seller stats retrieved successfully',
      stats: {
        totalProductsInCollection: totalProducts,
        categories: categoryStats,
        commissions: commissionStats
      }
    });

  } catch (error) {
    console.error('Error getting seller stats:', error);
    res.status(500).json({ 
      message: 'Error getting seller stats',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;