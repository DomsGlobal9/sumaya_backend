// const mongoose = require('mongoose');

// const productSchema = new mongoose.Schema({
//   articleNumber: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   category: {
//     type: String,
//     required: true
//   },
//   description: {
//     type: String,
//     required: true
//   },
//   vendor: {
//     type: String,
//     required: true
//   },
//   sizes: {
//     M: { type: String, default: 'A' },
//     L: { type: String, default: 'A' },
//     XL: { type: String, default: 'A' },
//     XXL: { type: String, default: 'A' },
//     "3XL": { type: String, default: 'A' }
//   },
//   stockValidation: {
//     type: String,
//     enum: ['Validated', 'Do Not Sell', 'Invalidated'],
//     default: 'Validated'
//   },
//   sellingLink: {
//     type: String,
//     required: true
//   },
//   fastSelling: {
//     type: Number,
//     required: true
//   },
//   commission: {
//     type: Number,
//     required: true
//   },
//   title: {
//     type: String,
//     default: 'Collections'
//   },
//   productId: {
//     type: String,
//     unique: true
//   },
//   designPattern: {
//     type: String
//   },
//   color: {
//     type: String
//   }
// })

// module.exports = mongoose.model('Product', productSchema);


const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  articleNumber: {
    type: String,
    required: [true, 'Article number is required'],
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  vendor: {
    type: String,
    required: [true, 'Vendor is required'],
    trim: true
  },
  sizes: {
    type: {
      M: { type: String, enum: ['Available', 'Out of Stock'], default: 'Available' },
      L: { type: String, enum: ['Available', 'Out of Stock'], default: 'Available' },
      XL: { type: String, enum: ['Available', 'Out of Stock'], default: 'Available' },
      XXL: { type: String, enum: ['Available', 'Out of Stock'], default: 'Available' },
      '3XL': { type: String, enum: ['Available', 'Out of Stock'], default: 'Available' }
    },
    required: true,
    default: {
      M: 'Available',
      L: 'Available',
      XL: 'Available',
      XXL: 'Available',
      '3XL': 'Available'
    }
  },
  stockValidation: {
    type: String,
    enum: ['Validated', 'Do Not Sell', 'Invalidated'],
    default: 'Validated',
    required: [true, 'Stock validation status is required']
  },
  sellingLink: {
    type: String,
    required: [true, 'Selling link is required'],
    trim: true
  },
  fastSelling: {
    type: Number,
    required: [true, 'Fast selling price is required'],
    min: [0, 'Fast selling price cannot be negative']
  },
  commission: {
    type: Number,
    required: [true, 'Commission is required'],
    min: [0, 'Commission cannot be negative']
  },
  title: {
    type: String,
    default: 'Collections',
    trim: true
  },
  productId: {
    type: Number,
    required: [true, 'Product ID is required'],
    unique: true,
    trim: true
  },
  designPattern: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields for tracking
});

module.exports = mongoose.model('Product', productSchema);