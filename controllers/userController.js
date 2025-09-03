// const UserCart = require('../models/UserCartModel');
// const Product = require('../models/ProductModel'); // Assuming you have a Product model
// const mongoose = require('mongoose');

// class UserCartController {
//   // Get user's cart
//   static async getCart(req, res) {
//     try {
//       const userId = req.user.id; // From auth middleware
      
//       let cart = await UserCart.findOne({ userId })
//         .populate('items.productId', 'name brand images stock sellingPrice displayMRP sizes')
//         .lean();

//       if (!cart) {
//         cart = {
//           userId,
//           items: [],
//           totalAmount: 0,
//           totalItems: 0
//         };
//       }

//       // Filter out items where product doesn't exist anymore
//       if (cart.items) {
//         cart.items = cart.items.filter(item => item.productId);
//       }

//       res.status(200).json({
//         success: true,
//         cart,
//         message: 'Cart retrieved successfully'
//       });
//     } catch (error) {
//       console.error('Get cart error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to retrieve cart',
//         error: error.message
//       });
//     }
//   }

//   // Add item to cart
//   static async addToCart(req, res) {
//     try {
//       const userId = req.user.id;
//       const { productId, quantity = 1, size = 'M' } = req.body;

//       // Validate input
//       if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
//         return res.status(400).json({
//           success: false,
//           message: 'Valid product ID is required'
//         });
//       }

//       if (quantity < 1 || quantity > 50) {
//         return res.status(400).json({
//           success: false,
//           message: 'Quantity must be between 1 and 50'
//         });
//       }

//       // Check if product exists and get details
//       const product = await Product.findById(productId);
//       if (!product) {
//         return res.status(404).json({
//           success: false,
//           message: 'Product not found'
//         });
//       }

//       // Check stock availability
//       if (product.stock < quantity) {
//         return res.status(400).json({
//           success: false,
//           message: `Only ${product.stock} items available in stock`
//         });
//       }

//       // Check if size is available
//       if (product.sizes && !product.sizes.includes(size)) {
//         return res.status(400).json({
//           success: false,
//           message: `Size ${size} is not available for this product`
//         });
//       }

//       // Find or create user cart
//       let cart = await UserCart.findOne({ userId });
      
//       if (!cart) {
//         cart = new UserCart({ 
//           userId, 
//           items: [],
//           totalAmount: 0,
//           totalItems: 0
//         });
//       }

//       // Check if item already exists in cart (same product and size)
//       const existingItemIndex = cart.items.findIndex(
//         item => item.productId.toString() === productId && item.size === size
//       );

//       const productDetails = {
//         name: product.name || product.description,
//         brand: product.brand,
//         image: product.images?.[0]?.url || '',
//         stock: product.stock,
//         sellingPrice: product.sellingPrice,
//         displayMRP: product.displayMRP
//       };

//       if (existingItemIndex > -1) {
//         // Update existing item
//         const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        
//         // Check total quantity doesn't exceed stock
//         if (newQuantity > product.stock) {
//           return res.status(400).json({
//             success: false,
//             message: `Cannot add ${quantity} more items. Only ${product.stock - cart.items[existingItemIndex].quantity} available.`
//           });
//         }

//         cart.items[existingItemIndex].quantity = newQuantity;
//         cart.items[existingItemIndex].productDetails = productDetails;
//       } else {
//         // Add new item
//         cart.items.push({
//           productId,
//           quantity,
//           size,
//           price: product.sellingPrice,
//           productDetails
//         });
//       }

//       await cart.save();

//       // Populate the response
//       await cart.populate('items.productId', 'name brand images stock sellingPrice displayMRP sizes');

//       res.status(200).json({
//         success: true,
//         cart,
//         message: 'Item added to cart successfully'
//       });
//     } catch (error) {
//       console.error('Add to cart error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to add item to cart',
//         error: error.message
//       });
//     }
//   }

//   // Update cart item quantity
//   static async updateCartItem(req, res) {
//     try {
//       const userId = req.user.id;
//       const { itemId } = req.params;
//       const { quantity } = req.body;

//       if (quantity < 1 || quantity > 50) {
//         return res.status(400).json({
//           success: false,
//           message: 'Quantity must be between 1 and 50'
//         });
//       }

//       const cart = await UserCart.findOne({ userId });
//       if (!cart) {
//         return res.status(404).json({
//           success: false,
//           message: 'Cart not found'
//         });
//       }

//       const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
//       if (itemIndex === -1) {
//         return res.status(404).json({
//           success: false,
//           message: 'Item not found in cart'
//         });
//       }

//       // Check stock for the product
//       const product = await Product.findById(cart.items[itemIndex].productId);
//       if (!product) {
//         return res.status(404).json({
//           success: false,
//           message: 'Product no longer exists'
//         });
//       }

//       if (quantity > product.stock) {
//         return res.status(400).json({
//           success: false,
//           message: `Only ${product.stock} items available in stock`
//         });
//       }

//       cart.items[itemIndex].quantity = quantity;
//       await cart.save();

//       await cart.populate('items.productId', 'name brand images stock sellingPrice displayMRP sizes');

//       res.status(200).json({
//         success: true,
//         cart,
//         message: 'Cart updated successfully'
//       });
//     } catch (error) {
//       console.error('Update cart error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to update cart',
//         error: error.message
//       });
//     }
//   }

//   // Remove item from cart
//   static async removeFromCart(req, res) {
//     try {
//       const userId = req.user.id;
//       const { itemId } = req.params;

//       const cart = await UserCart.findOne({ userId });
//       if (!cart) {
//         return res.status(404).json({
//           success: false,
//           message: 'Cart not found'
//         });
//       }

//       const initialLength = cart.items.length;
//       cart.items = cart.items.filter(item => item._id.toString() !== itemId);

//       if (cart.items.length === initialLength) {
//         return res.status(404).json({
//           success: false,
//           message: 'Item not found in cart'
//         });
//       }

//       await cart.save();
//       await cart.populate('items.productId', 'name brand images stock sellingPrice displayMRP sizes');

//       res.status(200).json({
//         success: true,
//         cart,
//         message: 'Item removed from cart successfully'
//       });
//     } catch (error) {
//       console.error('Remove from cart error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to remove item from cart',
//         error: error.message
//       });
//     }
//   }

//   // Clear entire cart
//   static async clearCart(req, res) {
//     try {
//       const userId = req.user.id;

//       const cart = await UserCart.findOne({ userId });
//       if (!cart) {
//         return res.status(404).json({
//           success: false,
//           message: 'Cart not found'
//         });
//       }

//       cart.items = [];
//       await cart.save();

//       res.status(200).json({
//         success: true,
//         cart,
//         message: 'Cart cleared successfully'
//       });
//     } catch (error) {
//       console.error('Clear cart error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to clear cart',
//         error: error.message
//       });
//     }
//   }

//   // Get cart count (for navbar badge)
//   static async getCartCount(req, res) {
//     try {
//       const userId = req.user.id;
      
//       const cart = await UserCart.findOne({ userId }, 'totalItems');
//       const count = cart ? cart.totalItems : 0;

//       res.status(200).json({
//         success: true,
//         count,
//         message: 'Cart count retrieved successfully'
//       });
//     } catch (error) {
//       console.error('Get cart count error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to get cart count',
//         error: error.message,
//         count: 0
//       });
//     }
//   }
// }

// module.exports = UserCartController;
import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';
// import UserCart from '../models/UserCartModel.js';
// const jwt = require('jsonwebtoken');

// Secret key for JWT (should be in .env file)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const JWT_EXPIRES_IN = '7d';

// Helper to sign JWT
const signToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Signup controller - FIXED EXPORT
export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields (username, email, password) are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Username or email already exists' 
      });
    }

    // Create new user
    const newUser = await User.create({ username, email, password });

    // Create empty cart for new user (only if UserCart model exists)
    // try {
    //   await UserCart.create({
    //     userId: newUser._id,
    //     items: [],
    //     totalAmount: 0,
    //     totalItems: 0
    //   });
    //   console.log(`✅ Cart created for user: ${newUser.username}`);
    // } catch (cartError) {
    //   console.log('⚠️ Cart creation skipped (UserCart model might not exist yet):', cartError.message);
    //   // Don't fail signup if cart creation fails
    // }

    // Generate token
    const token = signToken(newUser._id);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: { 
        id: newUser._id, 
        username: newUser.username, 
        email: newUser.email 
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during signup', 
      error: error.message 
    });
  }
};

// Login controller - FIXED EXPORT
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Use instance method to compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};

// Verify token controller - NEW
export const verifyToken = async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token - user not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token valid',
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email 
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Invalid token', 
      error: error.message 
    });
  }
};
