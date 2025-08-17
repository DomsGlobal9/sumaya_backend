const express = require('express');
const router = express.Router();
const productController = require('../controllers/ProductController');

// GET all products
router.get('/', productController.getAllProducts);

// GET a single product by articleNumber
router.get('/:articleNumber', productController.getProductById);

// POST a new product
router.post('/', productController.createProduct);

// PUT update a product
router.put('/:articleNumber', productController.updateProduct);

// DELETE a product
router.delete('/:articleNumber', productController.deleteProduct);

// POST bulk upload
router.post('/bulk', productController.bulkUpload);

module.exports = router;