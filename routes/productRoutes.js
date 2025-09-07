const express = require("express");
const {
  bulkUploadProducts,addProduct
} = require("../controllers/ProductController"); // Import controller
const Product = require("../models/ProductModel");
const { upload } = require("../config/cloudinary");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().lean(); // Fetch all products, use .lean() for plain JSON
    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error while fetching products" });
  }
});

// New route for single product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findOne({
      $or: [{ _id: req.params.id }, { articleNumber: req.params.id }],
    }).lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server error while fetching product" });
  }
});

module.exports = router;
// Bulk upload route (POST JSON body)
router.post("/bulk-upload", bulkUploadProducts);

// Add single product with image upload
// router.post('/addproduct', upload.array('images', 4), addProduct);
// router.post("/addproduct", upload.single("images"), addProduct);
// New route for single product upload (multipart/form-data)
router.post("/addproduct", upload.array('images', 4), addProduct);  // 'images' is the field name for file uploads

// New DELETE route
router.delete("/delete/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error while deleting product", error: error.message });
  }
});

module.exports = router;
