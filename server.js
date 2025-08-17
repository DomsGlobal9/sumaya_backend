require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose"); // ✅ Import mongoose
const cookieParser = require("cookie-parser");
const app = express();


// Middlewares
// app.use(cors(   {
//   origin: "http://localhost:5173", // or wherever your React app runs
//   credentials: true
// }));
app.use(express.json());

// Middlewares
app.use(cors({
  origin: ["https://thesumaya.com", "http://localhost:5173"],
  credentials: true
}));

// app.use(express.json());
app.use(cookieParser());
app.use(express.json({ limit: "10mb" })); // for base64 images

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/auth", require("./routes/sellerAuthRoutes"));
app.use("/api/tryon", require("./routes/tryon"));
// Mount routes
app.use('/api/products', productRoutes);
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));




// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();
// const mongoose = require("mongoose");
// const cookieParser = require("cookie-parser");
// const tryonRoutes = require("./routes/tryon");
// const app = express();

// const connectDB = require("./db");  // Import connectDB


// // Connect to MongoDB
// connectDB();
// // Middlewares - Single declarations only
// app.use(cors({
//   origin: [ "http://localhost:5173", "http://localhost:5000"],
//   credentials: true
// }));
// // "https://thesumaya.com",

// app.use(express.json({ limit: "10mb" })); // Single middleware for JSON with size limit for base64 images
// app.use(cookieParser());

// // Health check endpoint - Add this BEFORE other routes
// app.get("/api/health", (req, res) => {
//   res.json({ 
//     status: "OK", 
//     message: "Server is running",
//     timestamp: new Date().toISOString(),
//     port: process.env.PORT || 5000
//   });
// });



// app.use(express.json({ limit: "10mb" })); // for base64 images
// app.use("/api/tryon", tryonRoutes);



// // Routes
// // Auth routes (only if you have the auth routes file)
// try {
//   app.use("/api/auth", require("./routes/sellerAuthRoutes"));
//   console.log("✅ Auth routes loaded");
// } catch (err) {
//   console.log("⚠️ Auth routes not found - skipping");
// }

// // Try-on routes (this should work from your demo)
// try {
//   app.use("/api/tryon", require("./routes/tryon"));
//   console.log("✅ Try-on routes loaded");
// } catch (err) {
//   console.error("❌ Try-on routes error:", err.message);
// }

// // 404 handler for unmatched routes
// app.use("*", (req, res) => {
//   res.status(404).json({ 
//     error: "Route not found",
//     path: req.originalUrl,
//     method: req.method,
//     availableRoutes: [
//       "GET /api/health",
//       "POST /api/tryon",
//       "POST /api/auth/..."
//     ]
//   });
// });

// // Global error handler
// app.use((error, req, res, next) => {
//   console.error("Server error:", error);
//   res.status(500).json({ 
//     error: "Internal server error",
//     message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
//   });
// });

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
//   console.log(`🎯 Try-on endpoint: http://localhost:${PORT}/api/tryon`);
//   console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
//   console.log("=====================================");
// });