const Product = require('../models/ProductModel');

const bulkUploadProducts = async (req, res) => {
  try {
    const { products } = req.body;  // Expect { products: [...] } JSON

    if (!products || !Array.isArray(products)) {
      return res.status(400).json({ message: 'Invalid data format. Expect { products: [...] }' });
    }

    // Basic validation (extend as needed)
    for (const product of products) {
      if (!product.articleNumber || !product.category || !product.description || !product.designPattern || !product.color || !product.availableSizes.length || !product.sellingPrice) {
        return res.status(400).json({ message: 'Missing required fields in one or more products' });
      }
    }

    // Insert products (ignores duplicates due to unique articleNumber)
    const savedProducts = await Product.insertMany(products, { ordered: false });

    res.status(201).json({
      message: 'Bulk upload successful',
      insertedCount: savedProducts.length,
      data: savedProducts,
    });
  } catch (error) {
    if (error.code === 11000) {  // Duplicate key error
      return res.status(400).json({ message: 'Duplicate articleNumber found. Skipped duplicates.', error: error.message });
    }
    res.status(500).json({ message: 'Bulk upload failed', error: error.message });
  }
};

module.exports = { bulkUploadProducts };