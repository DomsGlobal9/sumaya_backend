// // // ==================== UPDATED CART MODEL: UserCart.js ====================
// // const mongoose = require('mongoose');

// // const cartItemSchema = new mongoose.Schema({
// //   productId: {
// //     type: mongoose.Schema.Types.ObjectId,
// //     ref: 'Product', // Make sure you have a Product model
// //     required: true
// //   },
// //   quantity: {
// //     type: Number,
// //     required: true,
// //     min: 1,
// //     default: 1
// //   },
// //   size: {
// //     type: String,
// //     required: true,
// //     default: 'M'
// //   },
// //   price: {
// //     type: Number,
// //     required: true,
// //     min: 0
// //   },
// //   // Store product details for faster access (denormalization)
// //   productDetails: {
// //     name: String,
// //     brand: String,
// //     image: String,
// //     stock: Number,
// //     sellingPrice: Number,
// //     displayMRP: Number
// //   },
// //   addedAt: {
// //     type: Date,
// //     default: Date.now
// //   }
// // });

// // const userCartSchema = new mongoose.Schema({
// //   userId: {
// //     type: mongoose.Schema.Types.ObjectId,
// //     ref: 'User', // References your existing User model
// //     required: true,
// //     unique: true // One cart per user
// //   },
// //   items: [cartItemSchema],
// //   totalAmount: {
// //     type: Number,
// //     default: 0
// //   },
// //   totalItems: {
// //     type: Number,
// //     default: 0
// //   },
// //   lastModified: {
// //     type: Date,
// //     default: Date.now
// //   }
// // }, {
// //   timestamps: true // Adds createdAt and updatedAt automatically
// // });

// // // Calculate totals before saving
// // userCartSchema.pre('save', function(next) {
// //   if (this.items && this.items.length > 0) {
// //     this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
// //     this.totalAmount = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
// //   } else {
// //     this.totalItems = 0;
// //     this.totalAmount = 0;
// //   }
// //   this.lastModified = new Date();
// //   next();
// // });

// // // Indexes for better performance
// // userCartSchema.index({ userId: 1 });
// // userCartSchema.index({ 'items.productId': 1 });
// // userCartSchema.index({ lastModified: 1 });

// // module.exports = mongoose.model('UserCart', userCartSchema);


// // ==================== MODEL: UserCart.js ====================
// const mongoose = require('mongoose');

// const cartItemSchema = new mongoose.Schema({
//   productId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true
//   },
//   quantity: {
//     type: Number,
//     required: true,
//     min: 1,
//     default: 1
//   },
//   size: {
//     type: String,
//     required: true,
//     default: 'M'
//   },
//   price: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   // Store product details for faster access
//   productDetails: {
//     name: String,
//     brand: String,
//     image: String,
//     stock: Number,
//     sellingPrice: Number,
//     displayMRP: Number
//   },
//   addedAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// const userCartSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//     unique: true
//   },
//   items: [cartItemSchema],
//   totalAmount: {
//     type: Number,
//     default: 0
//   },
//   totalItems: {
//     type: Number,
//     default: 0
//   },
//   lastModified: {
//     type: Date,
//     default: Date.now
//   }
// }, {
//   timestamps: true
// });

// // Calculate totals before saving
// userCartSchema.pre('save', function(next) {
//   if (this.items && this.items.length > 0) {
//     this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
//     this.totalAmount = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
//   } else {
//     this.totalItems = 0;
//     this.totalAmount = 0;
//   }
//   this.lastModified = new Date();
//   next();
// });

// // Index for better performance
// userCartSchema.index({ userId: 1 });
// userCartSchema.index({ 'items.productId': 1 });

// module.exports = mongoose.model('UserCart', userCartSchema);