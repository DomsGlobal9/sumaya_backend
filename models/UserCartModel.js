const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Reference to Product model
    required: [true, 'Product ID is required'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
  },
  size: {
    type: String,
    required: [true, 'Size is required'],
    enum: ['S', 'M', 'L', 'XL', 'XXL'], // Match availableSizes in ProductModel
  },
});

const userCartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to User model
    required: [true, 'User ID is required'],
    unique: true, // One cart per user
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0,
  },
  totalItems: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Pre-save middleware to update totalAmount and totalItems
userCartSchema.pre('save', async function (next) {
  // Populate productId to access sellingPrice
  await this.populate('items.productId');

  // Calculate totalItems and totalAmount
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalAmount = this.items.reduce((sum, item) => {
    const price = item.productId?.sellingPrice || 0;
    return sum + price * item.quantity;
  }, 0);

  next();
});

const UserCart = mongoose.model('UserCart', userCartSchema);

module.exports = UserCart;