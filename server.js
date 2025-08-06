require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose"); // ✅ Import mongoose

const app = express();

// // Middlewares
// app.use(cors(   {
//   origin: "http://localhost:5173", // or wherever your React app runs
//   credentials: true
// }));
// app.use(express.json());

// Middlewares
// app.use(cors(   {
//   origin: "https://thesumaya.com/", // or wherever your React app runs
//   credentials: true
// }));
// app.use(express.json());


const allowedOrigins = [
  "http://localhost:5173",
  "https://thesumaya.com" // ✅ Add this
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));






// Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/auth", require("./routes/sellerAuthRoutes"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
