const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ articleNumber: req.params.articleNumber });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  const product = new Product(req.body);
  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { articleNumber: req.params.articleNumber },
      req.body,
      { new: true }
    );
    if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findOneAndDelete({ articleNumber: req.params.articleNumber });
    if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.bulkUpload = async (req, res) => {
  try {
    const products = req.body;
    const operations = products.map(product => ({
      updateOne: {
        filter: { articleNumber: product.articleNumber }, // Use articleNumber as unique identifier
        update: { $set: product },
        upsert: true // Creates new document if no match, updates if exists
      }
    }));

    const result = await Product.bulkWrite(operations);
    res.status(201).json({ 
      message: 'Bulk upload successful', 
      insertedCount: result.upsertedCount, 
      modifiedCount: result.modifiedCount 
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};