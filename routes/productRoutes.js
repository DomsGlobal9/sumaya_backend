const express = require("express");
const {
  bulkUploadProducts,
  addProduct,
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
router.post("/addproduct", upload.array("images", 4), addProduct); // 'images' is the field name for file uploads

// PATCH route for updating a product
// PATCH route for updating a product
// router.patch("/update/:id", upload.array("images", 4), async (req, res) => {
//   try {
//     const productId = req.params.id;
//     const updateData = { ...req.body };

//     console.log("Update request received for product:", productId);
//     console.log("Update data:", updateData);

//     // Handle availableSizes if it comes as a comma-separated string
//     if (
//       updateData.availableSizes &&
//       typeof updateData.availableSizes === "string"
//     ) {
//       updateData.availableSizes = updateData.availableSizes
//         .split(",")
//         .map((size) => size.trim());
//     }

//     // Handle new image uploads
//     if (req.files && req.files.length > 0) {
//       console.log("New images uploaded:", req.files.length);
//       // Replace existing images with new ones
//       const imageUrls = req.files.map((file) => file.path);
//       updateData.images = imageUrls;
//     }

//     // Find and update the product
//     const updatedProduct = await Product.findByIdAndUpdate(
//       productId,
//       updateData,
//       {
//         new: true, // Return the updated document
//         runValidators: true, // Run mongoose validation
//       }
//     );

//     if (!updatedProduct) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     console.log("Product updated successfully:", updatedProduct._id);
//     res.status(200).json({
//       message: "Product updated successfully",
//       product: updatedProduct,
//     });
//   } catch (error) {
//     console.error("Error updating product:", error);
//     res.status(500).json({
//       message: "Server error while updating product",
//       error: error.message,
//     });
//   }
// });
// router.patch("/update/:id", upload.array("images", 4), async (req, res) => {
//   try {
//     const productId = req.params.id;
//     const updateData = { ...req.body };

//     console.log("Update request received for product:", productId);
//     console.log("Update data:", updateData);
//     console.log("Files received:", req.files);

//     // Handle availableSizes if it comes as a comma-separated string
//     if (
//       updateData.availableSizes &&
//       typeof updateData.availableSizes === "string"
//     ) {
//       updateData.availableSizes = updateData.availableSizes
//         .split(",")
//         .map((size) => size.trim());
//     }

//     // Handle new image uploads
//     if (req.files && req.files.length > 0) {
//       console.log("Processing new images:", req.files.length);
      
//       // Create image objects matching your schema
//       const newImages = req.files.map(file => ({
//         url: file.path,  // Cloudinary URL
//         altText: file.originalname || 'Product Image'
//       }));

//       console.log("New images formatted:", newImages);
//       updateData.images = newImages;
//     }

//     // Convert numeric fields to ensure they're numbers
//     if (updateData.sellingPrice) {
//       updateData.sellingPrice = Number(updateData.sellingPrice);
//     }
//     if (updateData.sellerCommission) {
//       updateData.sellerCommission = Number(updateData.sellerCommission);
//     }
//     if (updateData.displayMRP) {
//       updateData.displayMRP = Number(updateData.displayMRP);
//     }

//     console.log("Final update data:", updateData);

//     // Find and update the product
//     const updatedProduct = await Product.findByIdAndUpdate(
//       productId,
//       updateData,
//       {
//         new: true,
//         runValidators: true,
//       }
//     );

//     if (!updatedProduct) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     console.log("Product updated successfully:", updatedProduct._id);
//     res.status(200).json({
//       message: "Product updated successfully",
//       product: updatedProduct,
//     });
//   } catch (error) {
//     console.error("Error updating product:", error);
//     console.error("Error stack:", error.stack);
//     res.status(500).json({
//       message: "Server error while updating product",
//       error: error.message,
//     });
//   }
// });
router.patch("/update/:id", upload.array("images", 4), async (req, res) => {
  try {
    const productId = req.params.id;
    console.log("Update request received for product:", productId);
    console.log("Update data:", req.body);
    console.log("Files received:", req.files);

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Normalize existing images to objects (fix for legacy string-based images)
    product.images = product.images.reduce((acc, img) => {
      let url;
      let altText = 'Product Image';
      if (typeof img === 'string') {
        url = img;
      } else if (typeof img === 'object' && img !== null && img.url) {
        url = img.url;
        altText = img.altText || altText;
      }
      if (url) {
        acc.push({ url, altText });
      }
      return acc;
    }, []);

    // Apply text field updates
    const updateData = { ...req.body };
    // Clean up image-related fields from updateData
    delete updateData.keptPositions;
    delete updateData.newPositions;

    if (updateData.availableSizes && typeof updateData.availableSizes === "string") {
      updateData.availableSizes = updateData.availableSizes.split(",").map((size) => size.trim());
    }

    // Convert numeric fields
    if (updateData.sellingPrice) {
      updateData.sellingPrice = Number(updateData.sellingPrice);
    }
    if (updateData.sellerCommission) {
      updateData.sellerCommission = Number(updateData.sellerCommission);
    }
    if (updateData.displayMRP) {
      updateData.displayMRP = Number(updateData.displayMRP);
    }

    Object.assign(product, updateData);

    // Handle image updates (replace or add based on positions, up to 4 slots)
    let finalImages = product.images; // Default to normalized existing
    if (req.body.keptPositions || (req.files && req.files.length > 0)) {
      const kept = JSON.parse(req.body.keptPositions || '[]');
      const newPositions = JSON.parse(req.body.newPositions || '[]');

      if (newPositions.length !== (req.files ? req.files.length : 0)) {
        throw new Error('Mismatch between new positions and uploaded files');
      }

      const newImagesWithPos = req.files ? req.files.map((file, j) => ({
        position: newPositions[j],
        url: file.path,
        altText: file.originalname || 'Product Image'
      })) : [];

      finalImages = [];
      for (let pos = 0; pos < 4; pos++) {
        const keptItem = kept.find(k => k.position === pos);
        if (keptItem) {
          finalImages.push({ url: keptItem.url, altText: 'Product Image' });
          continue;
        }

        const newItem = newImagesWithPos.find(n => n.position === pos);
        if (newItem) {
          finalImages.push({ url: newItem.url, altText: newItem.altText });
        }
        // If neither, skip (effectively removes if it was there but not kept, but since kept includes all non-replaced, this maintains)
      }
    }

    product.images = finalImages;

    // Save the updated product
    await product.save();

    console.log("Product updated successfully:", product._id);
    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Server error while updating product",
      error: error.message,
    });
  }
});

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
    res
      .status(500)
      .json({
        message: "Server error while deleting product",
        error: error.message,
      });
  }
});

module.exports = router;
