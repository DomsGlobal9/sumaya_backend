// middlewares/authMiddleware.js
// const jwt = require("jsonwebtoken");

// exports.verifyToken = (req, res, next) => {
//   const token = req.cookies.token;
//   if (!token) {
//     return res.status(401).json({ message: "Unauthorized: No token" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(403).json({ message: "Invalid token" });
//   }
// };

// Example in authController.js
const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
  expiresIn: "7d",
});

res
  .cookie("token", token, {
    httpOnly: true, // Prevent access from JS (more secure)
    secure: process.env.NODE_ENV === "production", // true for https
    sameSite: "Lax", // or "None" if using cross-site
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  })
  .status(200)
  .json({ success: true, user });
