const Product = require("../models/ProductModel");
// const { cloudinary } = require("../config/cloudinary");

const bulkUploadProducts = async (req, res) => {
  try {
    const { products } = req.body; // Expect { products: [...] } JSON

    if (!products || !Array.isArray(products)) {
      return res
        .status(400)
        .json({ message: "Invalid data format. Expect { products: [...] }" });
    }

    // Basic validation (extend as needed)
    for (const product of products) {
      if (
        !product.articleNumber ||
        !product.category ||
        !product.description ||
        !product.designPattern ||
        !product.color ||
        !product.availableSizes.length ||
        !product.sellingPrice
      ) {
        return res
          .status(400)
          .json({ message: "Missing required fields in one or more products" });
      }
    }

    // Insert products (ignores duplicates due to unique articleNumber)
    const savedProducts = await Product.insertMany(products, {
      ordered: false,
    });

    res.status(201).json({
      message: "Bulk upload successful",
      insertedCount: savedProducts.length,
      data: savedProducts,
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      return res
        .status(400)
        .json({
          message: "Duplicate articleNumber found. Skipped duplicates.",
          error: error.message,
        });
    }
    res
      .status(500)
      .json({ message: "Bulk upload failed", error: error.message });
  }
};

// Generate unique article number
// const generateArticleNumber = async () => {
//   try {
//     const count = await Product.countDocuments();
//     return `ART${String(count + 1).padStart(6, "0")}`;
//   } catch (error) {
//     console.error("Error generating article number:", error);
//     throw error;
//   }
// };

// // Add single product
// const addProduct = async (req, res) => {
//   try {
//     console.log("=== REQUEST DEBUG ===");
//     console.log("Body:", req.body);
//     console.log("Files:", req.files);
//     console.log(
//       "Files:",
//       req.files.map((f) => ({
//         originalname: f.originalname,
//         mimetype: f.mimetype,
//         path: f.path,
//       }))
//     );

//     console.log("==================");

//     const {
//       category,
//       description,
//       designPattern,
//       color,
//       availableSizes,
//       sellingPrice,
//       sellerCommission,
//       displayMRP,
//     } = req.body;

//     // Validate required fields
//     if (
//       !category ||
//       !description ||
//       !designPattern ||
//       !color ||
//       !sellingPrice ||
//       !sellerCommission ||
//       !displayMRP
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields",
//         receivedFields: Object.keys(req.body),
//       });
//     }

//     // Parse sizes
//     let parsedSizes = [];
//     if (availableSizes) {
//       if (typeof availableSizes === "string") {
//         parsedSizes = availableSizes
//           .split(",")
//           .map((size) => size.trim())
//           .filter((size) => size);
//       } else if (Array.isArray(availableSizes)) {
//         parsedSizes = availableSizes;
//       }
//     }

//     if (parsedSizes.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "At least one size must be selected",
//       });
//     }

//     // Check for images
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "At least one product image is required",
//       });
//     }

//     // Generate article number
//     const articleNumber = await generateArticleNumber();

//     // Process images
//     const images = [];
//     console.log(images, "imagessssss");
//     for (const file of req.files) {
//       if (!file.path) {
//         throw new Error(
//           "Image upload failed - no path received from Cloudinary"
//         );
//       }
//       images.push({
//         url: file.path,
//         altText: `${description} - ${color}`,
//       });
//     }

//     // Create product
//     const productData = {
//       articleNumber,
//       category,
//       description,
//       designPattern,
//       color,
//       availableSizes: parsedSizes,
//       images,
//       sellingPrice: Number(sellingPrice),
//       sellerCommission: Number(sellerCommission),
//       displayMRP: Number(displayMRP),
//       stockValidation: "Validated",
//       isActive: true,
//     };

//     console.log("Creating product with data:", productData);

//     const newProduct = new Product(productData);
//     const savedProduct = await newProduct.save();

//     res.status(201).json({
//       success: true,
//       message: "Product added successfully",
//       product: savedProduct,
//     });
//   } catch (error) {
//     console.error("Error in addProduct:", {
//       message: error.message,
//       stack: error.stack,
//       name: error.name,
//     });

//     // Clean up uploaded images on error
//     if (req.files && req.files.length > 0) {
//       for (const file of req.files) {
//         try {
//           if (file.path) {
//             const parts = file.path.split("/");
//             const publicIdWithExt = parts[parts.length - 1];
//             const publicId = publicIdWithExt.split(".")[0];
//             await cloudinary.uploader.destroy(`sumaya-products/${publicId}`);
//           }
//         } catch (cleanupError) {
//           console.error("Error cleaning up image:", cleanupError.message);
//         }
//       }
//     }

//     res.status(500).json({
//       success: false,
//       message: "Error adding product",
//       error: error.message,
//       details: process.env.NODE_ENV === "development" ? error.stack : undefined,
//     });
//   }
// };

const addProduct = async (req, res) => {
  try {
    const {
      // articleNumber,
      category,
      description,
      designPattern,
      color,
      availableSizes,  // Expect comma-separated string or JSON array
      sellingPrice,
      sellerCommission,
      displayMRP,
      stockValidation = 'Validated',  // Default if not provided
      isActive = true,  // Default if not provided
    } = req.body;

    // Basic validation for required fields
    if (
      // !articleNumber ||
      !category ||
      !description ||
      !designPattern ||
      !color ||
      !availableSizes ||
      !sellingPrice ||
      !sellerCommission ||
      !displayMRP
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Process availableSizes: if string, split by comma; if array, use as-is
    let sizesArray = Array.isArray(availableSizes)
      ? availableSizes
      : availableSizes.split(',').map(size => size.trim()).filter(size => size);

    if (!sizesArray.length) {
      return res.status(400).json({ message: "Available sizes must be provided" });
    }

    // Process images: req.files will have array of uploaded files from Cloudinary
    const images = req.files
      ? req.files.map(file => ({
          url: file.path,  // Cloudinary URL
          altText: file.originalname || 'Product Image',  // Use original filename as alt or default
        }))
      : [];  // No images provided

    // Create product object
    const newProduct = new Product({
      // articleNumber,
      category,
      description,
      designPattern,
      color,
      availableSizes: sizesArray,
      stockValidation,
      images,
      sellingPrice: Number(sellingPrice),  // Ensure number
      sellerCommission: Number(sellerCommission),
      displayMRP: Number(displayMRP),
      isActive: Boolean(isActive),
    });

    // Save to MongoDB
    const savedProduct = await newProduct.save();

    res.status(201).json({
      message: "Product added successfully",
      data: savedProduct,
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate articleNumber
      return res.status(400).json({
        message: "Duplicate articleNumber found. Product already exists.",
        error: error.message,
      });
    }
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Failed to add product", error: error.message });
  }
};

module.exports = { bulkUploadProducts , addProduct};
