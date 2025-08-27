const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
}, { timestamps: true });

// Create compound index to prevent duplicate products for same user
wishlistSchema.index({ userId: 1, 'items.productId': 1 }, { unique: true, sparse: true });

// Instance method to add product to wishlist
wishlistSchema.methods.addProduct = function(productId) {
  const existingItem = this.items.find(item => 
    item.productId.toString() === productId.toString()
  );
  
  if (!existingItem) {
    this.items.push({ productId });
  }
  return this;
};

// Instance method to remove product from wishlist
wishlistSchema.methods.removeProduct = function(productId) {
  this.items = this.items.filter(item => 
    item.productId.toString() !== productId.toString()
  );
  return this;
};

// Instance method to check if product exists in wishlist
wishlistSchema.methods.hasProduct = function(productId) {
  return this.items.some(item => 
    item.productId.toString() === productId.toString()
  );
};

// Static method to find or create wishlist for user
wishlistSchema.statics.findOrCreateForUser = async function(userId) {
  let wishlist = await this.findOne({ userId });
  if (!wishlist) {
    wishlist = new this({ userId, items: [] });
    await wishlist.save();
  }
  return wishlist;
};

module.exports = mongoose.model('Wishlist', wishlistSchema);