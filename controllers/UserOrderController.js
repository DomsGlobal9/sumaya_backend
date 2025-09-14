const UserOrder = require('../models/UserOrderModel'); // Adjust path as needed

// Create a new user order
exports.createUserOrder = async (req, res) => {
  try {
    const { items, shippingInfo, totalAmount, paymentMethod } = req.body;
    const userId = req.user.id; // Assuming auth middleware provides req.user

    const newOrder = new UserOrder({
      userId,
      items,
      shippingInfo,
      totalAmount,
      paymentMethod,
    });

    await newOrder.save();
    res.status(201).json({ success: true, order: newOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all orders for the logged-in user
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await UserOrder.find({ userId }).populate('items.productId', 'description images sellingPrice');
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get a single order by ID (for details)
exports.getUserOrderById = async (req, res) => {
  try {
    const order = await UserOrder.findById(req.params.id).populate('items.productId', 'description images sellingPrice');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};