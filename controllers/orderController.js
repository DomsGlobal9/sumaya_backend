const Order = require("../models/Order");
const Seller = require("../models/Seller");
const checkAuth = require("../middleware/checkAuth");
const crypto = require("crypto");

// exports.createOrder = async (req, res) => {
//     console.log("Create order request body:", req.body);
//   try {
//     const { cart, shippingInfo, totalAmount, paymentMethod } = req.body;
//     const userId = req.user.id;

//     if (
//       !cart ||
//       !cart.length ||
//       !shippingInfo ||
//       !totalAmount ||
//       !paymentMethod
//     ) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const orderNumber = crypto.randomBytes(4).toString("hex").toUpperCase();
//     const order = new Order({
//       userId,
//       items: cart.map((item) => ({
//         productId: item.product?._id || item.productId, // fall back if only productId sent
//         quantity: item.quantity,
//         size: item.size,
//         price: item.price,
//       })),
//       shippingInfo,
//       totalAmount,
//       paymentMethod,
//       orderNumber,
//     });

//     await order.save();
//     res.status(201).json({ 
//   message: "Order created successfully", 
//   order: {
//     orderNumber: order.orderNumber,
//     // include other fields if needed
//   } 
// });
//   } catch (error) {
//     console.error("Create order error:", error);
//     res.status(500).json({ message: "Server error during order creation" });
//   }
// };
exports.createOrder = async (req, res) => {
  try {
    const { cart, shippingInfo, totalAmount, paymentMethod } = req.body;
    
    console.log('Create order request body:', req.body);
    
    // Validate required fields
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is required and must contain at least one item'
      });
    }
    
    if (!shippingInfo || !totalAmount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: shippingInfo, totalAmount, or paymentMethod'
      });
    }
    
    // Get userId from authenticated user (assuming you have auth middleware)
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }
    
    // Better order number generation options:
    
    // Option 1: Sequential with date (recommended for e-commerce)
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const orderCount = await Order.countDocuments() + 1;
    const orderNumber = `SUM${today}${String(orderCount).padStart(4, '0')}`; // SUM202408260001
    
    // Option 2: Simple timestamp-based (current approach, but cleaner)
    // const orderNumber = 'SUM' + Date.now();
    
    // Option 3: Date + random (balance of readability and uniqueness)
    // const orderNumber = 'SUM' + today + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    // Prepare order data matching your schema
    const orderData = {
      userId: userId,
      items: cart, // cart already contains productId, quantity, size, price after frontend transformation
      shippingInfo: shippingInfo,
      totalAmount: totalAmount,
      paymentMethod: paymentMethod,
      orderNumber: orderNumber,
      status: 'pending'
    };
    
    console.log('Creating order with data:', orderData);
    
    // Create order
    const order = new Order(orderData);
    const savedOrder = await order.save();
    
    console.log('Order created successfully:', savedOrder);
    
    // Populate product details for response
    await savedOrder.populate('items.productId');
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: savedOrder
    });
    
  } catch (error) {
    console.error('Create order error:', error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).populate(
      "items.productId"
    );
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Server error during fetching orders" });
  }
};
