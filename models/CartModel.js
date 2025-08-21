// const mongoose = require('mongoose');

// const cartItemSchema = new mongoose.Schema({
//   product: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: [true, 'Product is required']
//   },
//   quantity: {
//     type: Number,
//     required: [true, 'Quantity is required'],
//     min: [1, 'Quantity must be at least 1'],
//     default: 1
//   },
//   size: {
//     type: String,
//     enum: ['M', 'L', 'XL', 'XXL', '3XL'],
//     required: [true, 'Size is required']
//   },
//   price: {
//     type: Number,
//     required: [true, 'Price is required'],
//     min: [0, 'Price cannot be negative']
//   },
//   commission: {
//     type: Number,
//     required: [true, 'Commission is required'],
//     min: [0, 'Commission cannot be negative']
//   }
// }, {
//   timestamps: true
// });

// const cartSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Seller',
//     required: [true, 'User is required'],
//     unique: true
//   },
//   items: [cartItemSchema],
//   totalAmount: {
//     type: Number,
//     default: 0,
//     min: [0, 'Total amount cannot be negative']
//   },
//   totalCommission: {
//     type: Number,
//     default: 0,
//     min: [0, 'Total commission cannot be negative']
//   },
//   itemCount: {
//     type: Number,
//     default: 0,
//     min: [0, 'Item count cannot be negative']
//   }
// }, {
//   timestamps: true
// });

// // Calculate totals before saving
// cartSchema.pre('save', function(next) {
//   this.totalAmount = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
//   this.totalCommission = this.items.reduce((total, item) => total + (item.commission * item.quantity), 0);
//   this.itemCount = this.items.reduce((total, item) => total + item.quantity, 0);
//   next();
// });

// // Method to add item to cart
// cartSchema.methods.addItem = function(productId, quantity, size, price, commission) {
//   const existingItemIndex = this.items.findIndex(
//     item => item.product.toString() === productId && item.size === size
//   );

//   if (existingItemIndex > -1) {
//     // Update existing item quantity
//     this.items[existingItemIndex].quantity += quantity;
//   } else {
//     // Add new item
//     this.items.push({
//       product: productId,
//       quantity,
//       size,
//       price,
//       commission
//     });
//   }
  
//   return this.save();
// };

// // Method to remove item from cart
// cartSchema.methods.removeItem = function(itemId) {
//   this.items.id(itemId).remove();
//   return this.save();
// };

// // Method to update item quantity
// cartSchema.methods.updateItemQuantity = function(itemId, quantity) {
//   if (quantity <= 0) {
//     return this.removeItem(itemId);
//   }
  
//   const item = this.items.id(itemId);
//   if (item) {
//     item.quantity = quantity;
//   }
//   return this.save();
// };

// // Method to clear cart
// cartSchema.methods.clearCart = function() {
//   this.items = [];
//   return this.save();
// };

// module.exports = mongoose.model('Cart', cartSchema);


// models/Cart.js
// const mongoose = require("mongoose");

// const cartSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   items: [
//     {
//       product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
//       seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
//       quantity: { type: Number, default: 1 },
//       price: { type: Number, required: true } // store price at the time of adding
//     }
//   ]
// }, { timestamps: true });

// module.exports = mongoose.model("Cart", cartSchema);
