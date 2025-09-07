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