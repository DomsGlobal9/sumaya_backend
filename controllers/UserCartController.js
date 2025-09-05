// const UserCart = require('../models/UserCartModel');
// const Product = require('../models/ProductModel');
// const jwt = require('jsonwebtoken');

// const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// // Middleware to get userId from JWT token
// const getUserIdFromToken = (req) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     throw new Error('Authentication token required');
//   }
//   const token = authHeader.replace('Bearer ', '');
//   const decoded = jwt.verify(token, JWT_SECRET);
//   return decoded.id;
// };

// // Add item to cart
// // exports.addToCart = async (req, res) => {
// //   try {
// //     const userId = getUserIdFromToken(req);
// //     const { productId, quantity, size } = req.body;

// //     // Validate inputs
// //     if (!productId || !quantity || !size) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Product ID, quantity, and size are required',
// //       });
// //     }
// //     if (quantity < 1) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Quantity must be at least 1',
// //       });
// //     }

// //     // Validate product
// //     const product = await Product.findById(productId);
// //     if (!product) {
// //       return res.status(404).json({
// //         success: false,
// //         message: 'Product not found',
// //       });
// //     }
// //     if (!product.isActive || product.stockValidation !== 'Validated') {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Product is not available',
// //       });
// //     }
// //     if (!product.availableSizes.includes(size)) {
// //       return res.status(400).json({
// //         success: false,
// //         message: `Invalid size selected. Available sizes: ${product.availableSizes.join(', ')}`,
// //       });
// //     }

// //     // Find or create cart
// //     let cart = await UserCart.findOne({ userId });
// //     if (!cart) {
// //       cart = new UserCart({ userId, items: [], totalAmount: 0, totalItems: 0 });
// //     }

// //     // Check if item already exists in cart (same productId and size)
// //     const itemIndex = cart.items.findIndex(
// //       (item) => item.productId.toString() === productId && item.size === size
// //     );

// //     if (itemIndex > -1) {
// //       // Update quantity
// //       cart.items[itemIndex].quantity += quantity;
// //     } else {
// //       // Add new item
// //       cart.items.push({ productId, quantity, size });
// //     }

// //     // Save cart
// //     await cart.save();

// //     // Populate product details for response
// //     await cart.populate('items.productId');

// //     res.status(200).json({
// //       success: true,
// //       message: 'Item added to cart',
// //       cart,
// //     });
// //   } catch (error) {
// //     console.error('Add to cart error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Failed to add item to cart',
// //       error: error.message,
// //     });
// //   }
// // };

// exports.addToCart = async (req, res) => {
//   try {
//     const { productId, quantity, size } = req.body;
//     if (!productId || !quantity) {
//       return res.status(400).json({
//         success: false,
//         message: 'Product ID and quantity are required',
//       });
//     }

//     let cart = await UserCart.findOne({ userId: req.user._id });
//     if (!cart) {
//       cart = await UserCart.create({
//         userId: req.user._id,
//         items: [],
//         totalAmount: 0,
//         totalItems: 0,
//       });
//     }

//     const itemIndex = cart.items.findIndex(
//       (item) => item.productId.toString() === productId && item.size === size
//     );

//     if (itemIndex > -1) {
//       cart.items[itemIndex].quantity += quantity;
//     } else {
//       cart.items.push({ productId, quantity, size });
//     }

//     cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    
//     await cart.save();
//     await cart.populate('items.productId'); // Populate product data

//     res.status(200).json({
//       success: true,
//       message: 'Item added to cart',
//       cart,
//     });
//   } catch (error) {
//     console.error('Error adding to cart:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error adding to cart',
//     });
//   }
// };

// // Get cart
// // exports.getCart = async (req, res) => {
// //   try {
// //     const userId = getUserIdFromToken(req);

// //     const cart = await UserCart.findOne({ userId }).populate('items.productId');
// //     if (!cart) {
// //       return res.status(200).json({
// //         success: true,
// //         cart: { items: [], totalAmount: 0, totalItems: 0 },
// //       });
// //     }

// //     res.status(200).json({
// //       success: true,
// //       cart,
// //     });
// //   } catch (error) {
// //     console.error('Get cart error:', error);
// //     res.status(500).json({
// //       success: false,
// //       message: 'Failed to fetch cart',
// //       error: error.message,
// //     });
// //   }
// // };

// exports.getCart = async () => {
//   if (!token) {
//     console.log('No token found, resetting cart');
//     setCart({ items: [], totalAmount: 0, totalItems: 0 });
//     setCartCount(0);
//     return;
//   }

//   console.log('Token being sent:', token); // Debug token
//   try {
//     setIsCartLoading(true);
//     const response = await fetch(`${API_BASE_URL}/api/cart`, {
//       headers: { 'Authorization': `Bearer ${token}` },
//     });

//     const data = await response.json();
//     console.log('Cart response:', data); // Debug response
//     if (response.ok) {
//       setCart(data.cart);
//       setCartCount(data.cart.totalItems || 0);
//     } else {
//       console.error('Failed to fetch cart:', data.message);
//       setCart({ items: [], totalAmount: 0, totalItems: 0 });
//       setCartCount(0);
//     }
//   } catch (error) {
//     console.error('Error fetching cart:', error);
//     setCart({ items: [], totalAmount: 0, totalItems: 0 });
//     setCartCount(0);
//   } finally {
//     setIsCartLoading(false);
//   }
// };

// // Update cart item
// exports.updateCartItem = async (req, res) => {
//   try {
//     const userId = getUserIdFromToken(req);
//     const { itemId } = req.params;
//     const { quantity } = req.body;

//     if (!quantity || quantity < 1) {
//       return res.status(400).json({
//         success: false,
//         message: 'Valid quantity is required',
//       });
//     }

//     const cart = await UserCart.findOne({ userId });
//     if (!cart) {
//       return res.status(404).json({
//         success: false,
//         message: 'Cart not found',
//       });
//     }

//     const item = cart.items.id(itemId);
//     if (!item) {
//       return res.status(404).json({
//         success: false,
//         message: 'Item not found in cart',
//       });
//     }

//     // Validate product availability
//     const product = await Product.findById(item.productId);
//     if (!product || !product.isActive || product.stockValidation !== 'Validated') {
//       return res.status(400).json({
//         success: false,
//         message: 'Product is not available',
//       });
//     }

//     item.quantity = quantity;
//     await cart.save();

//     await cart.populate('items.productId');

//     res.status(200).json({
//       success: true,
//       message: 'Cart item updated',
//       cart,
//     });
//   } catch (error) {
//     console.error('Update cart item error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update cart item',
//       error: error.message,
//     });
//   }
// };

// // Remove item from cart
// exports.removeFromCart = async (req, res) => {
//   try {
//     const userId = getUserIdFromToken(req);
//     const { itemId } = req.params;

//     const cart = await UserCart.findOne({ userId });
//     if (!cart) {
//       return res.status(404).json({
//         success: false,
//         message: 'Cart not found',
//       });
//     }

//     const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
//     if (itemIndex === -1) {
//       return res.status(404).json({
//         success: false,
//         message: 'Item not found in cart',
//       });
//     }

//     cart.items.splice(itemIndex, 1);
//     await cart.save();

//     await cart.populate('items.productId');

//     res.status(200).json({
//       success: true,
//       message: 'Item removed from cart',
//       cart,
//     });
//   } catch (error) {
//     console.error('Remove from cart error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to remove item from cart',
//       error: error.message,
//     });
//   }
// };

// // Clear cart
// exports.clearCart = async (req, res) => {
//   try {
//     const userId = getUserIdFromToken(req);

//     const cart = await UserCart.findOne({ userId });
//     if (!cart) {
//       return res.status(200).json({
//         success: true,
//         message: 'Cart is already empty',
//         cart: { items: [], totalAmount: 0, totalItems: 0 },
//       });
//     }

//     cart.items = [];
//     cart.totalAmount = 0;
//     cart.totalItems = 0;
//     await cart.save();

//     res.status(200).json({
//       success: true,
//       message: 'Cart cleared',
//       cart,
//     });
//   } catch (error) {
//     console.error('Clear cart error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to clear cart',
//       error: error.message,
//     });
//   }
// };

// // Get cart count
// exports.getCartCount = async (req, res) => {
//   try {
//     const userId = getUserIdFromToken(req);

//     const cart = await UserCart.findOne({ userId });
//     const count = cart ? cart.totalItems : 0;

//     res.status(200).json({
//       success: true,
//       count,
//     });
//   } catch (error) {
//     console.error('Get cart count error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to get cart count',
//       error: error.message,
//     });
//   }
// };


// // Add these methods to your UserCartController.js

// exports.updateCartItem = async (req, res) => {
//   try {
//     const { itemId } = req.params;
//     const { quantity } = req.body;

//     if (!quantity || quantity < 1) {
//       return res.status(400).json({
//         success: false,
//         message: 'Valid quantity is required'
//       });
//     }

//     const cart = await UserCart.findOne({ userId: req.user._id });
//     if (!cart) {
//       return res.status(404).json({
//         success: false,
//         message: 'Cart not found'
//       });
//     }

//     const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
//     if (itemIndex === -1) {
//       return res.status(404).json({
//         success: false,
//         message: 'Item not found in cart'
//       });
//     }

//     cart.items[itemIndex].quantity = quantity;
//     cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    
//     await cart.save();
//     await cart.populate('items.productId');

//     res.status(200).json({
//       success: true,
//       message: 'Cart updated successfully',
//       cart
//     });
//   } catch (error) {
//     console.error('Error updating cart:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error updating cart'
//     });
//   }
// };

// exports.removeFromCart = async (req, res) => {
//   try {
//     const { itemId } = req.params;

//     const cart = await UserCart.findOne({ userId: req.user._id });
//     if (!cart) {
//       return res.status(404).json({
//         success: false,
//         message: 'Cart not found'
//       });
//     }

//     cart.items = cart.items.filter(item => item._id.toString() !== itemId);
//     cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    
//     await cart.save();
//     await cart.populate('items.productId');

//     res.status(200).json({
//       success: true,
//       message: 'Item removed from cart',
//       cart
//     });
//   } catch (error) {
//     console.error('Error removing from cart:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error removing from cart'
//     });
//   }
// };

// exports.clearCart = async (req, res) => {
//   try {
//     const cart = await UserCart.findOne({ userId: req.user._id });
//     if (!cart) {
//       return res.status(404).json({
//         success: false,
//         message: 'Cart not found'
//       });
//     }

//     cart.items = [];
//     cart.totalItems = 0;
//     cart.totalAmount = 0;
    
//     await cart.save();

//     res.status(200).json({
//       success: true,
//       message: 'Cart cleared successfully',
//       cart
//     });
//   } catch (error) {
//     console.error('Error clearing cart:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error clearing cart'
//     });
//   }
// };

// exports.getCartCount = async (req, res) => {
//   try {
//     const cart = await UserCart.findOne({ userId: req.user._id });
//     const count = cart ? cart.totalItems : 0;

//     res.status(200).json({
//       success: true,
//       count
//     });
//   } catch (error) {
//     console.error('Error getting cart count:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error getting cart count'
//     });
//   }
// };


const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const UserCart = require('../models/UserCartModel');

// Secret key for JWT (should be in .env file)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const JWT_EXPIRES_IN = '7d';

// Helper to sign JWT
const signToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Signup controller
const signup = async (req, res) => {
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

    // Create empty cart for new user
    try {
      await UserCart.create({
        userId: newUser._id,
        items: [],
        totalAmount: 0,
        totalItems: 0
      });
      console.log(`✅ Cart created for user: ${newUser.username}`);
    } catch (cartError) {
      console.log('⚠️ Cart creation skipped:', cartError.message);
    }

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

// Login controller
const login = async (req, res) => {
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

// Verify token controller
const verifyToken = async (req, res) => {
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

// Cart controllers
const getCart = async (req, res) => {
  try {
    const cart = await UserCart.findOne({ userId: req.user._id }).populate('items.productId');
    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: { items: [], totalAmount: 0, totalItems: 0 },
      });
    }
    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching cart',
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity, size } = req.body;
    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and quantity are required',
      });
    }

    let cart = await UserCart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = await UserCart.create({
        userId: req.user._id,
        items: [],
        totalAmount: 0,
        totalItems: 0,
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId && item.size === size
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity, size });
    }

    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    
    await cart.save();
    await cart.populate('items.productId');

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      cart,
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding to cart',
    });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    const cart = await UserCart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    cart.items[itemIndex].quantity = quantity;
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    
    await cart.save();
    await cart.populate('items.productId');

    res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      cart
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating cart'
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await UserCart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    
    await cart.save();
    await cart.populate('items.productId');

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing from cart'
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await UserCart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    cart.totalItems = 0;
    cart.totalAmount = 0;
    
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Server error clearing cart'
    });
  }
};

const getCartCount = async (req, res) => {
  try {
    const cart = await UserCart.findOne({ userId: req.user._id });
    const count = cart ? cart.totalItems : 0;

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error getting cart count:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting cart count'
    });
  }
};

module.exports = {
  signup,
  login,
  verifyToken,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount
};