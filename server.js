require("dotenv").config();
const express = require("express");
const cors = require("cors");
const productRoutes = require('./routes/productRoutes');
const mongoose = require("mongoose"); // ✅ Import mongoose
const cookieParser = require("cookie-parser");
const app = express();
const cartRoutes = require("./routes/cartRoutes");
const authRoutes = require("./routes/sellerAuthRoutes");
const orderRoutes = require('./routes/orderRoutes');
const wishlistRoutes = require('./routes/WishlistRoutes');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/sellerAuthRoutes');

const userCartRoutes = require('./routes/UserCartRoutes');

app.use(express.json());

// Middlewares
// app.use(cors({
//   origin: ["https://thesumaya.com", "http://localhost:5173","https://sumaya-admin.vercel.app/","https://sumaya-admin-git-main-domsgloals-projects.vercel.app/"],
//   credentials: true
// }));
const allowedOrigins = [
  "https://thesumaya.com", 
  "http://localhost:5173",
  "https://sumaya-admin.vercel.app/",
  "https://sumaya-admin-git-main-domsgloals-projects.vercel.app/"
];

app.use(cors({
  origin: function(origin, callback){
    // Allow requests with no origin like Curl or Postman
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));



// app.use(express.json());
app.use(cookieParser());
app.use(express.json({ limit: "10mb" })); // for base64 images

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use('/api', authRoutes); // This makes /api/register work

app.use("/api/auth", authRoutes);
app.use("/api/tryon", require("./routes/tryon"));
//useing for theme

app.use('/api/orders', require('./routes/orderRoutes'));

app.use('/api/products', productRoutes);
app.use("/api/cart", cartRoutes)
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);


app.use('/api/profile/:id', profileRoutes);

// Routes of user routes not seller
app.use('/api/users', userRoutes);
app.use('/api/usercart', userCartRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


