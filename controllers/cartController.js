// const Cart = require('../models/CartModel');
// const Product = require('../models/ProductModel');
// // const catchAsync = require('../utils/catchAsync');
// // const AppError = require('../utils/appError');

// // Get user's cart
// exports.getCart = async (req, res, next) => {
//   let cart = await Cart.findOne({ user: req.user.id }).populate({
//     path: 'items.product',
//     select: 'articleNumber category description vendor fastSelling commission title productId designPattern color sizes stockValidation'
//   });

//   if (!cart) {
//     cart = await Cart.create({ user: req.user.id, items: [] });
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       cart
//     }
//   });
// };

// // Add item to cart
// exports.addToCart = async (req, res) => {
//   const { productId, quantity = 1, size } = req.body;

// console.log("hello")

//   // Validate required fields
//   if (!productId || !size) {
//     return (new AppError('Product ID and size are required', 400));
//   }
// console.log(productId,quantity,size,"frommmm")
//   // Check if product exists and is available
//   const product = await Product.findOne({productId});
//   if (!product) {
//     return next(new AppError('Product not found', 404));
//   }
// console.log(product,"productsssssss")
//   // Check if product is validated and in stock
//   if (product.stockValidation !== 'Validated') {
//     return next(new AppError('Product is not available for sale', 400));
//   }

//   // Check if requested size is available
//   if (!product.sizes[size] || product.sizes[size] === 'Out of Stock') {
//     return next(new AppError(`Size ${size} is out of stock`, 400));
//   }

//   // Find or create cart
//   let cart = await Cart.findOne({ user: req.user.id });
//   if (!cart) {
//     cart = await Cart.create({ user: req.user.id, items: [] });
//   }

//   // Add item to cart
//   await cart.addItem(productId, quantity, size, product.fastSelling, product.commission);

//   // Populate the cart with product details
//   await cart.populate({
//     path: 'items.product',
//     select: 'articleNumber category description vendor fastSelling commission title productId designPattern color sizes stockValidation'
//   });

//   res.status(200).json({
//     status: 'success',
//     message: 'Item added to cart successfully',
//     data: {
//       cart
//     }
//   });
// }

// // Update item quantity in cart
// exports.updateCartItem = async (req, res, next) => {
//   const { itemId } = req.params;
//   const { quantity } = req.body;

//   if (!quantity || quantity < 0) {
//     return next(new AppError('Valid quantity is required', 400));
//   }

//   const cart = await Cart.findOne({ user: req.user.id });
//   if (!cart) {
//     return next(new AppError('Cart not found', 404));
//   }

//   // Check if item exists in cart
//   const item = cart.items.id(itemId);
//   if (!item) {
//     return next(new AppError('Item not found in cart', 404));
//   }

//   // Update quantity
//   await cart.updateItemQuantity(itemId, quantity);

//   // Populate the cart with product details
//   await cart.populate({
//     path: 'items.product',
//     select: 'articleNumber category description vendor fastSelling commission title productId designPattern color sizes stockValidation'
//   });

//   res.status(200).json({
//     status: 'success',
//     message: 'Cart updated successfully',
//     data: {
//       cart
//     }
//   });
// }

// // Remove item from cart
// exports.removeFromCart = async (req, res, next) => {
//   const { itemId } = req.params;

//   const cart = await Cart.findOne({ user: req.user.id });
//   if (!cart) {
//     return next(new AppError('Cart not found', 404));
//   }

//   // Check if item exists in cart
//   const item = cart.items.id(itemId);
//   if (!item) {
//     return next(new AppError('Item not found in cart', 404));
//   }

//   // Remove item
//   await cart.removeItem(itemId);

//   // Populate the cart with product details
//   await cart.populate({
//     path: 'items.product',
//     select: 'articleNumber category description vendor fastSelling commission title productId designPattern color sizes stockValidation'
//   });

//   res.status(200).json({
//     status: 'success',
//     message: 'Item removed from cart successfully',
//     data: {
//       cart
//     }
//   });
// }

// // Clear entire cart
// exports.clearCart = async (req, res, next) => {
//   const cart = await Cart.findOne({ user: req.user.id });
//   if (!cart) {
//     return next(new AppError('Cart not found', 404));
//   }

//   await cart.clearCart();

//   res.status(200).json({
//     status: 'success',
//     message: 'Cart cleared successfully',
//     data: {
//       cart
//     }
//   });
// }

// // Get cart item count
// exports.getCartCount = async (req, res, next) => {
//   const cart = await Cart.findOne({ user: req.user.id });
//   const itemCount = cart ? cart.itemCount : 0;

//   res.status(200).json({
//     status: 'success',
//     data: {
//       itemCount
//     }
//   });
// }























// const Cart = require('../models/CartModel');
// const Product = require('../models/ProductModel');

// // Get user's cart
// exports.getCart = async (req, res) => {
//   let cart = await Cart.findOne({ user: req.user.id }).populate({
//     path: 'items.product',
//     select: 'articleNumber category description vendor fastSelling commission title productId designPattern color sizes stockValidation'
//   });

//   if (!cart) {
//     cart = await Cart.create({ user: req.user.id, items: [] });
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       cart
//     }
//   });
// };

// // Add item to cart
// exports.addToCart = async (req, res) => {
//   try {
//     const userId = req.user.id; // from authMiddleware
//     const { productId, quantity } = req.body;
//     console.log(productId, quantity, "from addToCart");

//     // Fetch product details
//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     // Check if user already has a cart
//     let cart = await Cart.findOne({ user: userId });
//     if (!cart) {
//       cart = new Cart({ user: userId, items: [] });
//     }

//     // Check if product already exists in cart
//     const existingItem = cart.items.find(
//       (item) => item.product.toString() === productId
//     );

//     if (existingItem) {
//       existingItem.quantity += quantity;
//     } else {
//       // Push product snapshot (id, price, seller, quantity)
//       cart.items.push({
//         product: product._id,
//         seller: product.seller,   // assuming Product has seller field
//         price: product.price,     // snapshot of current price
//         quantity,
//       });
//     }

//     await cart.save();
//     res.json({ cart });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Update item quantity in cart
// exports.updateCartItem = async (req, res) => {
//   const { itemId } = req.params;
//   const { quantity } = req.body;

//   if (!quantity || quantity < 0) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Valid quantity is required'
//     });
//   }

//   const cart = await Cart.findOne({ user: req.user.id });
//   if (!cart) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Cart not found'
//     });
//   }

//   // Check if item exists in cart
//   const item = cart.items.id(itemId);
//   if (!item) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Item not found in cart'
//     });
//   }

//   // Update quantity
//   await cart.updateItemQuantity(itemId, quantity);

//   // Populate the cart with product details
//   await cart.populate({
//     path: 'items.product',
//     select: 'articleNumber category description vendor fastSelling commission title productId designPattern color sizes stockValidation'
//   });

//   res.status(200).json({
//     status: 'success',
//     message: 'Cart updated successfully',
//     data: {
//       cart
//     }
//   });
// }

// // Remove item from cart
// exports.removeFromCart = async (req, res) => {
//   const { itemId } = req.params;

//   const cart = await Cart.findOne({ user: req.user.id });
//   if (!cart) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Cart not found'
//     });
//   }

//   // Check if item exists in cart
//   const item = cart.items.id(itemId);
//   if (!item) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Item not found in cart'
//     });
//   }

//   // Remove item
//   await cart.removeItem(itemId);

//   // Populate the cart with product details
//   await cart.populate({
//     path: 'items.product',
//     select: 'articleNumber category description vendor fastSelling commission title productId designPattern color sizes stockValidation'
//   });

//   res.status(200).json({
//     status: 'success',
//     message: 'Item removed from cart successfully',
//     data: {
//       cart
//     }
//   });
// }

// // Clear entire cart
// exports.clearCart = async (req, res) => {
//   const cart = await Cart.findOne({ user: req.user.id });
//   if (!cart) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Cart not found'
//     });
//   }

//   await cart.clearCart();

//   res.status(200).json({
//     status: 'success',
//     message: 'Cart cleared successfully',
//     data: {
//       cart
//     }
//   });
// }

// // Get cart item count
// exports.getCartCount = async (req, res) => {
//   const cart = await Cart.findOne({ user: req.user.id });
//   const itemCount = cart ? cart.itemCount : 0;

//   res.status(200).json({
//     status: 'success',
//     data: {
//       itemCount
//     }
//   });
// }

const Cart = require("../models/CartModel");
const Product = require("../models/ProductModel");
const Seller = require("../models/Seller");

exports.addToCart = async (req, res) => {
  try {
    const { productId, size, quantity } = req.body;
    const userId = req.user.id;

    if (!productId || !size || !quantity) {
      return res.status(400).json({ message: "Product ID, size, and quantity are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (!product.availableSizes.includes(size)) {
      return res.status(400).json({ message: `Size ${size} not available` });
    }
    if (product.stockValidation !== "Validated") {
      return res.status(400).json({ message: "Product is not validated" });
    }

    const seller = await Seller.findById(userId);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId && item.size === size
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, size, quantity });
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate("items.productId", "articleNumber description images sellingPrice sellerCommission")
      .lean();

    const totalAmount = populatedCart.items.reduce(
      (sum, item) => sum + item.quantity * item.productId.sellingPrice,
      0
    );

    res.status(200).json({
      message: "Item added to cart",
      cart: { ...populatedCart, totalAmount },
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Server error while adding to cart" });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.body;
    const userId = req.user.id;

    if (!itemId) {
      return res.status(400).json({ message: "Item ID is required" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate("items.productId", "articleNumber description images sellingPrice sellerCommission")
      .lean();

    const totalAmount = populatedCart.items.reduce(
      (sum, item) => sum + item.quantity * item.productId.sellingPrice,
      0
    );

    res.status(200).json({
      message: "Item removed from cart",
      cart: { ...populatedCart, totalAmount },
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: "Server error while removing from cart" });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const userId = req.user.id;

    if (!itemId || !quantity) {
      return res.status(400).json({ message: "Item ID and quantity are required" });
    }
    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex((item) => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate("items.productId", "articleNumber description images sellingPrice sellerCommission")
      .lean();

    const totalAmount = populatedCart.items.reduce(
      (sum, item) => sum + item.quantity * item.productId.sellingPrice,
      0
    );

    res.status(200).json({
      message: "Cart item updated",
      cart: { ...populatedCart, totalAmount },
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ message: "Server error while updating cart item" });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(200).json({ message: "Cart is already empty", cart: { items: [], totalAmount: 0 } });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({ message: "Cart cleared", cart: { items: [], totalAmount: 0 } });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Server error while clearing cart" });
  }
};

exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId })
      .populate("items.productId", "articleNumber description images sellingPrice sellerCommission")
      .lean();

    if (!cart) {
      return res.status(200).json({ cart: { items: [], totalAmount: 0 } });
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.productId.sellingPrice,
      0
    );

    res.status(200).json({ cart: { ...cart, totalAmount } });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Server error while fetching cart" });
  }
};