const Wishlist = require('../models/WishlistModel');
const Product = require('../models/ProductModel');

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    const wishlist = await Wishlist.findOne({ userId })
      .populate({
        path: 'items.productId',
        select: 'articleNumber category description designPattern color images sellingPrice displayMRP isActive',
        match: { isActive: true } // Only populate active products
      });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        wishlist: { items: [] },
        totalItems: 0
      });
    }

    // Filter out items where productId is null (inactive products)
    const filteredItems = wishlist.items.filter(item => item.productId !== null);

    const responseData = {
      _id: wishlist._id,
      userId: wishlist.userId,
      items: filteredItems,
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt
    };

    res.status(200).json({
      success: true,
      wishlist: responseData,
      totalItems: filteredItems.length
    });

  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id || req.user._id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }

    // Find or create wishlist for user
    let wishlist = await Wishlist.findOrCreateForUser(userId);

    // Check if product already in wishlist
    if (wishlist.hasProduct(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    // Add product to wishlist
    wishlist.addProduct(productId);
    await wishlist.save();

    // Populate and return updated wishlist
    await wishlist.populate({
      path: 'items.productId',
      select: 'articleNumber category description designPattern color images sellingPrice displayMRP isActive'
    });

    res.status(201).json({
      success: true,
      message: 'Product added to wishlist',
      wishlist: wishlist,
      totalItems: wishlist.items.length
    });

  } catch (error) {
    console.error('Add to wishlist error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to add product to wishlist',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id || req.user._id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    // Check if product exists in wishlist
    if (!wishlist.hasProduct(productId)) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in wishlist'
      });
    }

    // Remove product from wishlist
    wishlist.removeProduct(productId);
    await wishlist.save();

    // Populate and return updated wishlist
    await wishlist.populate({
      path: 'items.productId',
      select: 'articleNumber category description designPattern color images sellingPrice displayMRP isActive'
    });

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      wishlist: wishlist,
      totalItems: wishlist.items.length
    });

  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove product from wishlist',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Toggle product in wishlist (add if not present, remove if present)
exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id || req.user._id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find or create wishlist for user
    let wishlist = await Wishlist.findOrCreateForUser(userId);

    let message;
    let isAdded;

    if (wishlist.hasProduct(productId)) {
      // Remove from wishlist
      wishlist.removeProduct(productId);
      message = 'Product removed from wishlist';
      isAdded = false;
    } else {
      // Add to wishlist (only if product is active)
      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Product is not available'
        });
      }
      wishlist.addProduct(productId);
      message = 'Product added to wishlist';
      isAdded = true;
    }

    await wishlist.save();

    // Populate and return updated wishlist
    await wishlist.populate({
      path: 'items.productId',
      select: 'articleNumber category description designPattern color images sellingPrice displayMRP isActive'
    });

    res.status(200).json({
      success: true,
      message: message,
      isAdded: isAdded,
      wishlist: wishlist,
      totalItems: wishlist.items.length
    });

  } catch (error) {
    console.error('Toggle wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle wishlist',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Clear entire wishlist
exports.clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    wishlist.items = [];
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Wishlist cleared successfully',
      wishlist: wishlist,
      totalItems: 0
    });

  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear wishlist',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Check if product is in user's wishlist
exports.checkWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id || req.user._id;

    const wishlist = await Wishlist.findOne({ userId });
    const isInWishlist = wishlist ? wishlist.hasProduct(productId) : false;

    res.status(200).json({
      success: true,
      isInWishlist: isInWishlist
    });

  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check wishlist',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};