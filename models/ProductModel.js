const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  articleNumber: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  vendor: {
    type: String,
    required: true
  },
  sizes: {
    M: { type: String, default: 'A' },
    L: { type: String, default: 'A' },
    XL: { type: String, default: 'A' },
    XXL: { type: String, default: 'A' },
    "3XL": { type: String, default: 'A' }
  },
  stockValidation: {
    type: String,
    enum: ['Validated', 'Do Not Sell', 'Invalidated'],
    default: 'Validated'
  },
  sellingLink: {
    type: String,
    required: true
  },
  fastSelling: {
    type: Number,
    required: true
  },
  commission: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    default: 'Collections'
  },
  productId: {
    type: String,
    unique: true
  },
  designPattern: {
    type: String
  },
  color: {
    type: String
  }
});

module.exports = mongoose.model('Product', productSchema);