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
    required: true,
    unique: true,  // Acts as SKU
  },
  category: {
    type: String,
    required: true,  // e.g., "3PC Kurthi", "Cord set"
  },
  description: {
    type: String,
    required: true,
  },
  designPattern: {
    type: String,
    required: true,  // Extracted from description
  },
  color: {
    type: String,
    required: true,  // Extracted from description
  },
  availableSizes: {
    type: [String],  // Array e.g., ["M", "L", "XL"]
    required: true,
  },
  stockValidation: {
    type: String,
    default: 'Validated',
  },
  images: [
    {
      url: { type: String, required: true },
      altText: { type: String, default: 'Product Image' },
    },
  ],
  sellingPrice: {
    type: Number,
    required: true,
  },
  sellerCommission: {
    type: Number,
    required: true,
  },
  displayMRP: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);