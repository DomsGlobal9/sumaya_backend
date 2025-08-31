
// const Seller = require("../models/Seller");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const sendEmail = require('../utils/email');
// const crypto = require('crypto');

// exports.registerSeller = async (req, res) => {
//   const { username, email, password, confirmPassword, role } = req.body;

//   try {
//     // Input validation
//     if (!username || !email || !password || !confirmPassword) {
//       return res.status(400).json({ 
//         message: "All fields are required" 
//       });
//     }

//     // Validate password match
//     if (password !== confirmPassword) {
//       return res.status(400).json({ 
//         message: "Passwords do not match" 
//       });
//     }

//     // Additional validations - Updated to match frontend requirements
//     if (username.length < 3) {
//       return res.status(400).json({ 
//         message: "Username must be at least 3 characters long" 
//       });
//     }

//     // Changed from 6 to 8 to match schema and frontend validation
//     if (password.length < 8) {
//       return res.status(400).json({ 
//         message: "Password must be at least 8 characters long" 
//       });
//     }

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ 
//         message: "Please provide a valid email address" 
//       });
//     }

//     // Check if email exists
//     const existingUser = await Seller.findOne({ email: email.toLowerCase() });
//     if (existingUser) {
//       return res.status(400).json({ 
//         message: "Email already in use" 
//       });
//     }

//     // Check if username exists
//     const existingUsername = await Seller.findOne({ username });
//     if (existingUsername) {
//       return res.status(400).json({ 
//         message: "Username already taken" 
//       });
//     }

//     // ✅ REMOVED MANUAL PASSWORD HASHING - Let Mongoose schema handle it
//     // Create seller - password will be hashed by the pre('save') hook
//     const newSeller = new Seller({
//       username: username.trim(),
//       email: email.toLowerCase().trim(),
//       password: password, // ✅ Don't hash here, let schema do it
//       role: role || "seller",
//     });

//     await newSeller.save();

//     // Return success response with proper JSON
//     return res.status(201).json({ 
//       message: "Account created successfully",
//       user: {
//         id: newSeller._id,
//         username: newSeller.username,
//         email: newSeller.email,
//         role: newSeller.role
//       }
//     });
    
//   } catch (error) {
//     console.error("Signup error:", error);
    
//     // Handle specific MongoDB errors
//     if (error.code === 11000) {
//       // Duplicate key error
//       const field = Object.keys(error.keyPattern)[0];
//       return res.status(400).json({ 
//         message: `${field} already exists` 
//       });
//     }
    
//     // Handle validation errors
//     if (error.name === 'ValidationError') {
//       const messages = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ 
//         message: messages.join(', ') 
//       });
//     }

//     // Generic server error
//     res.status(500).json({ 
//       message: "Server error occurred while creating account",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// exports.loginSeller = async (req, res) => {
//   try {
//     const { email, password, role } = req.body;
//     const seller = await Seller.findOne({ email });
//     if (!seller || seller.role !== role) {
//       return res.status(401).json({ message: "Invalid credentials or role" });
//     }
    
//     // ✅ Use the schema method for password comparison
//     const isMatch = await seller.comparePassword(password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }
    
//     const token = jwt.sign(
//       { id: seller._id, role: seller.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     }).status(200).json({
//       message: "Login successful",
//       token,
//       seller: {
//         id: seller._id,
//         email: seller.email,
//         username: seller.username,
//         role: seller.role,
//       },
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ message: "Server error during login" });
//   }
// };

// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     // 1. Validate email
//     if (!email) {
//       return res.status(400).json({
//         status: 'fail',
//         message: 'Please provide an email address'
//       });
//     }

//     // 2. Check if user exists
//     const seller = await Seller.findOne({ email });
//     if (!seller) {
//       return res.status(404).json({
//         status: 'fail',
//         message: 'No account found with that email address'
//       });
//     }

//     // 3. Generate reset token
//     const resetToken = seller.createPasswordResetToken();
//     await seller.save({ validateBeforeSave: false });

//     // 4. Send email with reset URL
//     const resetURL =` ${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
//     try {
//       await sendEmail({
//         email: seller.email,
//         subject: 'Your password reset token (valid for 10 min)',
//         message: `Forgot your password? Click this link to reset it: ${resetURL}\nIf you didn't request this, please ignore this email.`
//       });

//       res.status(200).json({
//         status: 'success',
//         message: 'email sent successfully!'
//       });
//     } catch (err) {
//       // Reset the token if email fails
//       seller.passwordResetToken = undefined;
//       seller.passwordResetExpires = undefined;
//       await seller.save({ validateBeforeSave: false });

//       return res.status(500).json({
//         status: 'error',
//         message: 'There was an error sending the email. Try again later!'
//       });
//     }
//   } catch (err) {
//     res.status(500).json({
//       status: 'error',
//       message: err.message
//     });
//   }
// };

// exports.resetPassword = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { password } = req.body;

//     if (!token || !password) {
//       return res.status(400).json({ status: 'fail', message: 'Missing token or password' });
//     }

//     // 1. Hash the token to match the stored one
//     const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

//     // 2. Find seller by hashed token and check if not expired
//     const seller = await Seller.findOne({
//       passwordResetToken: hashedToken,
//       passwordResetExpires: { $gt: Date.now() }
//     });

//     if (!seller) {
//       return res.status(400).json({ status: 'fail', message: 'Token is invalid or has expired' });
//     }

//     // 3. Update password - Let the schema handle hashing
//     seller.password = password; // ✅ Don't hash here, let pre('save') hook do it
//     seller.passwordResetToken = undefined;
//     seller.passwordResetExpires = undefined;

//     await seller.save();

//     res.status(200).json({ status: 'success', message: 'Password reset successful!' });
//   } catch (err) {
//     res.status(500).json({ status: 'error', message: err.message });
//   }
// };

// exports.logout = (req, res) => {
//   res.clearCookie("token", {
//     httpOnly: true,
//     sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
//     secure: process.env.NODE_ENV === "production",
//   });
//   res.status(200).json({ message: "Logged out successfully" });
// };











// const Seller = require("../models/Seller");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const sendEmail = require('../utils/email');
// const crypto = require('crypto');

// // exports.registerSeller = async (req, res) => {
// //   const { username, email, password, confirmPassword, role } = req.body;

// //   try {
// //     // Input validation
// //     if (!username || !email || !password || !confirmPassword) {
// //       return res.status(400).json({ 
// //         message: "All fields are required" 
// //       });
// //     }

// //     // Validate password match
// //     if (password !== confirmPassword) {
// //       return res.status(400).json({ 
// //         message: "Passwords do not match" 
// //       });
// //     }

// //     // Additional validations - Updated to match frontend requirements
// //     if (username.length < 3) {
// //       return res.status(400).json({ 
// //         message: "Username must be at least 3 characters long" 
// //       });
// //     }

// //     // Changed from 6 to 8 to match schema and frontend validation
// //     if (password.length < 8) {
// //       return res.status(400).json({ 
// //         message: "Password must be at least 8 characters long" 
// //       });
// //     }

// //     // Validate email format
// //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// //     if (!emailRegex.test(email)) {
// //       return res.status(400).json({ 
// //         message: "Please provide a valid email address" 
// //       });
// //     }

// //     // Check if email exists
// //     const existingUser = await Seller.findOne({ email: email.toLowerCase() });
// //     if (existingUser) {
// //       return res.status(400).json({ 
// //         message: "Email already in use" 
// //       });
// //     }

// //     // Check if username exists
// //     const existingUsername = await Seller.findOne({ username });
// //     if (existingUsername) {
// //       return res.status(400).json({ 
// //         message: "Username already taken" 
// //       });
// //     }

// //     // Create seller - password will be hashed by the pre('save') hook
// //     const newSeller = new Seller({
// //       username: username.trim(),
// //       email: email.toLowerCase().trim(),
// //       password: password,
// //       role: role || "seller",
// //     });

// //     await newSeller.save();

// //     // Return success response with proper JSON
// //     return res.status(201).json({ 
// //       message: "Account created successfully",
// //       user: {
// //         id: newSeller._id,
// //         username: newSeller.username,
// //         email: newSeller.email,
// //         role: newSeller.role,
// //         profileComplete: newSeller.profileComplete
// //       }
// //     });
    
// //   } catch (error) {
// //     console.error("Signup error:", error);
    
// //     // Handle specific MongoDB errors
// //     if (error.code === 11000) {
// //       // Duplicate key error
// //       const field = Object.keys(error.keyPattern)[0];
// //       return res.status(400).json({ 
// //         message: `${field} already exists` 
// //       });
// //     }
    
// //     // Handle validation errors
// //     if (error.name === 'ValidationError') {
// //       const messages = Object.values(error.errors).map(err => err.message);
// //       return res.status(400).json({ 
// //         message: messages.join(', ') 
// //       });
// //     }

// //     // Generic server error
// //     res.status(500).json({ 
// //       message: "Server error occurred while creating account",
// //       error: process.env.NODE_ENV === 'development' ? error.message : undefined
// //     });
// //   }
// // };
// exports.registerSeller = async (req, res) => {
//   const { username, email, password, confirmPassword, role } = req.body;

//   try {
//     // Input validation
//     if (!username || !email || !password || !confirmPassword) {
//       return res.status(400).json({ 
//         message: "All fields are required" 
//       });
//     }

//     // Validate password match
//     if (password !== confirmPassword) {
//       return res.status(400).json({ 
//         message: "Passwords do not match" 
//       });
//     }

//     // Additional validations - Updated to match frontend requirements
//     if (username.length < 3) {
//       return res.status(400).json({ 
//         message: "Username must be at least 3 characters long" 
//       });
//     }

//     // Changed from 6 to 8 to match schema and frontend validation
//     if (password.length < 8) {
//       return res.status(400).json({ 
//         message: "Password must be at least 8 characters long" 
//       });
//     }

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ 
//         message: "Please provide a valid email address" 
//       });
//     }

//     // Check if email exists
//     const existingUser = await Seller.findOne({ email: email.toLowerCase() });
//     if (existingUser) {
//       return res.status(400).json({ 
//         message: "Email already in use" 
//       });
//     }

//     // Check if username exists
//     const existingUsername = await Seller.findOne({ username });
//     if (existingUsername) {
//       return res.status(400).json({ 
//         message: "Username already taken" 
//       });
//     }

//     // Create seller - password will be hashed by the pre('save') hook
//     const newSeller = new Seller({
//       username: username.trim(),
//       email: email.toLowerCase().trim(),
//       password: password,
//       role: role || "seller",
//     });

//     await newSeller.save();

//     // Generate JWT token for the new user
//     const token = jwt.sign(
//       { id: newSeller._id, role: newSeller.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     // Set cookie
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     // Return success response with token
//     return res.status(201).json({ 
//       message: "Account created successfully",
//       token,
//       user: {
//         id: newSeller._id,
//         username: newSeller.username,
//         email: newSeller.email,
//         role: newSeller.role,
//         profileComplete: newSeller.profileComplete
//       }
//     });
    
//   } catch (error) {
//     console.error("Signup error:", error);
    
//     // Handle specific MongoDB errors
//     if (error.code === 11000) {
//       // Duplicate key error
//       const field = Object.keys(error.keyPattern)[0];
//       return res.status(400).json({ 
//         message: `${field} already exists` 
//       });
//     }
    
//     // Handle validation errors
//     if (error.name === 'ValidationError') {
//       const messages = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ 
//         message: messages.join(', ') 
//       });
//     }

//     // Generic server error
//     res.status(500).json({ 
//       message: "Server error occurred while creating account",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// exports.updateProfile = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { shopName, logo, theme, bankDetails } = req.body;

//     // Find the seller
//     const seller = await Seller.findById(id);
//     if (!seller) {
//       return res.status(404).json({ 
//         message: "Seller not found" 
//       });
//     }

//     // Update shop name if provided
//     if (shopName) {
//       seller.shopName = shopName.trim();
//     }

//     // Update logo information if provided
//     if (logo) {
//       seller.logo = {
//         type: logo.type || 'generated',
//         url: logo.url,
//         style: logo.style
//       };
//     }

//     // Update theme information if provided
//     if (theme) {
//       seller.theme = {
//         id: theme.id,
//         name: theme.name
//       };
//     }

//     // Update bank details if provided
//     if (bankDetails) {
//       seller.bankDetails = {
//         accountHolder: bankDetails.accountHolder?.trim(),
//         bankName: bankDetails.bankName?.trim(),
//         ifsc: bankDetails.ifsc?.trim().toUpperCase(),
//         accountNumber: bankDetails.accountNumber?.trim(),
//         pan: bankDetails.pan?.trim().toUpperCase(),
//         aadhar: bankDetails.aadhar?.trim()
//       };
//     }

//     // Update profile completion status
//     seller.updateProfileCompletionStatus();

//     await seller.save();

//     res.status(200).json({
//       message: "Profile updated successfully",
//       user: {
//         id: seller._id,
//         username: seller.username,
//         email: seller.email,
//         role: seller.role,
//         shopName: seller.shopName,
//         logo: seller.logo,
//         theme: seller.theme,
//         bankDetails: seller.bankDetails,
//         profileComplete: seller.profileComplete
//       }
//     });

//   } catch (error) {
//     console.error("Update profile error:", error);
    
//     // Handle validation errors
//     if (error.name === 'ValidationError') {
//       const messages = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ 
//         message: messages.join(', ') 
//       });
//     }

//     res.status(500).json({ 
//       message: "Server error occurred while updating profile",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// exports.completeProfile = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { shopName, logo, theme, bankDetails } = req.body;

//     // Validate required fields
//     if (!shopName || !logo?.url || !theme?.id || !bankDetails) {
//       return res.status(400).json({ 
//         message: "All profile information is required (shopName, logo, theme, bankDetails)" 
//       });
//     }

//     // Validate bank details
//     const requiredBankFields = ['accountHolder', 'bankName', 'ifsc', 'accountNumber', 'pan', 'aadhar'];
//     const missingFields = requiredBankFields.filter(field => !bankDetails[field]);
    
//     if (missingFields.length > 0) {
//       return res.status(400).json({ 
//         message: `Missing required bank details: ${missingFields.join(', ')}` 
//       });
//     }

//     // Find the seller
//     const seller = await Seller.findById(id);
//     if (!seller) {
//       return res.status(404).json({ 
//         message: "Seller not found" 
//       });
//     }

//     // Update all profile information
//     seller.shopName = shopName.trim();
//     seller.logo = {
//       type: logo.type || 'generated',
//       url: logo.url,
//       style: logo.style
//     };
//     seller.theme = {
//       id: theme.id,
//       name: theme.name
//     };
//     seller.bankDetails = {
//       accountHolder: bankDetails.accountHolder.trim(),
//       bankName: bankDetails.bankName.trim(),
//       ifsc: bankDetails.ifsc.trim().toUpperCase(),
//       accountNumber: bankDetails.accountNumber.trim(),
//       pan: bankDetails.pan.trim().toUpperCase(),
//       aadhar: bankDetails.aadhar.trim()
//     };

//     // Update profile completion status
//     seller.updateProfileCompletionStatus();

//     await seller.save();

//     res.status(200).json({
//       message: "Profile completed successfully",
//       user: {
//         id: seller._id,
//         username: seller.username,
//         email: seller.email,
//         role: seller.role,
//         shopName: seller.shopName,
//         logo: seller.logo,
//         theme: seller.theme,
//         bankDetails: seller.bankDetails,
//         profileComplete: seller.profileComplete
//       }
//     });

//   } catch (error) {
//     console.error("Complete profile error:", error);
    
//     // Handle validation errors
//     if (error.name === 'ValidationError') {
//       const messages = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ 
//         message: messages.join(', ') 
//       });
//     }

//     res.status(500).json({ 
//       message: "Server error occurred while completing profile",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// exports.getProfile = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     const seller = await Seller.findById(id);
//     if (!seller) {
//       return res.status(404).json({ 
//         message: "Seller not found" 
//       });
//     }

//     res.status(200).json({
//       user: {
//         id: seller._id,
//         username: seller.username,
//         email: seller.email,
//         role: seller.role,
//         shopName: seller.shopName,
//         logo: seller.logo,
//         theme: seller.theme,
//         bankDetails: seller.bankDetails,
//         profileComplete: seller.profileComplete,
//         createdAt: seller.createdAt,
//         updatedAt: seller.updatedAt
//       }
//     });

//   } catch (error) {
//     console.error("Get profile error:", error);
//     res.status(500).json({ 
//       message: "Server error occurred while fetching profile",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// exports.loginSeller = async (req, res) => {
//   try {
//     const { email, password, role } = req.body;
//     const seller = await Seller.findOne({ email });
//     if (!seller || seller.role !== role) {
//       return res.status(401).json({ message: "Invalid credentials or role" });
//     }
    
//     // Use the schema method for password comparison
//     const isMatch = await seller.comparePassword(password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }
    
//     const token = jwt.sign(
//       { id: seller._id, role: seller.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     }).status(200).json({
//       message: "Login successful",
//       token,
//       seller: {
//         id: seller._id,
//         email: seller.email,
//         username: seller.username,
//         role: seller.role,
//         shopName: seller.shopName,
//         profileComplete: seller.profileComplete,
//       },
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ message: "Server error during login" });
//   }
// };

// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     // 1. Validate email
//     if (!email) {
//       return res.status(400).json({
//         status: 'fail',
//         message: 'Please provide an email address'
//       });
//     }

//     // 2. Check if user exists
//     const seller = await Seller.findOne({ email });
//     if (!seller) {
//       return res.status(404).json({
//         status: 'fail',
//         message: 'No account found with that email address'
//       });
//     }

//     // 3. Generate reset token
//     const resetToken = seller.createPasswordResetToken();
//     await seller.save({ validateBeforeSave: false });

//     // 4. Send email with reset URL
//     const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
//     try {
//       await sendEmail({
//         email: seller.email,
//         subject: 'Your password reset token (valid for 10 min)',
//         message: `Forgot your password? Click this link to reset it: ${resetURL}\nIf you didn't request this, please ignore this email.`
//       });

//       res.status(200).json({
//         status: 'success',
//         message: 'email sent successfully!'
//       });
//     } catch (err) {
//       // Reset the token if email fails
//       seller.passwordResetToken = undefined;
//       seller.passwordResetExpires = undefined;
//       await seller.save({ validateBeforeSave: false });

//       return res.status(500).json({
//         status: 'error',
//         message: 'There was an error sending the email. Try again later!'
//       });
//     }
//   } catch (err) {
//     res.status(500).json({
//       status: 'error',
//       message: err.message
//     });
//   }
// };

// exports.resetPassword = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { password } = req.body;

//     if (!token || !password) {
//       return res.status(400).json({ status: 'fail', message: 'Missing token or password' });
//     }

//     // 1. Hash the token to match the stored one
//     const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

//     // 2. Find seller by hashed token and check if not expired
//     const seller = await Seller.findOne({
//       passwordResetToken: hashedToken,
//       passwordResetExpires: { $gt: Date.now() }
//     });

//     if (!seller) {
//       return res.status(400).json({ status: 'fail', message: 'Token is invalid or has expired' });
//     }

//     // 3. Update password - Let the schema handle hashing
//     seller.password = password;
//     seller.passwordResetToken = undefined;
//     seller.passwordResetExpires = undefined;

//     await seller.save();

//     res.status(200).json({ status: 'success', message: 'Password reset successful!' });
//   } catch (err) {
//     res.status(500).json({ status: 'error', message: err.message });
//   }
// };

// exports.logout = (req, res) => {
//   res.clearCookie("token", {
//     httpOnly: true,
//     sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
//     secure: process.env.NODE_ENV === "production",
//   });
//   res.status(200).json({ message: "Logged out successfully" });
// };

// const Seller = require("../models/Seller");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const sendEmail = require('../utils/email');
// const crypto = require('crypto');

// exports.registerSeller = async (req, res) => {
//   const { username, email, password, confirmPassword, role } = req.body;

//   try {
//     // Input validation
//     if (!username || !email || !password || !confirmPassword) {
//       return res.status(400).json({ 
//         message: "All fields are required" 
//       });
//     }

//     // Validate password match
//     if (password !== confirmPassword) {
//       return res.status(400).json({ 
//         message: "Passwords do not match" 
//       });
//     }

//     // Additional validations - Updated to match frontend requirements
//     if (username.length < 3) {
//       return res.status(400).json({ 
//         message: "Username must be at least 3 characters long" 
//       });
//     }

//     // Changed from 6 to 8 to match schema and frontend validation
//     if (password.length < 8) {
//       return res.status(400).json({ 
//         message: "Password must be at least 8 characters long" 
//       });
//     }

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ 
//         message: "Please provide a valid email address" 
//       });
//     }

//     // Check if email exists
//     const existingUser = await Seller.findOne({ email: email.toLowerCase() });
//     if (existingUser) {
//       return res.status(400).json({ 
//         message: "Email already in use" 
//       });
//     }

//     // Check if username exists
//     const existingUsername = await Seller.findOne({ username });
//     if (existingUsername) {
//       return res.status(400).json({ 
//         message: "Username already taken" 
//       });
//     }

//     // Create seller - password will be hashed by the pre('save') hook
//     const newSeller = new Seller({
//       username: username.trim(),
//       email: email.toLowerCase().trim(),
//       password: password,
//       role: role || "seller",
//     });

//     await newSeller.save();

//     // Generate JWT token for the new user
//     const token = jwt.sign(
//       { id: newSeller._id, role: newSeller.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     // Set cookie
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     // Return success response with token
//     return res.status(201).json({ 
//       message: "Account created successfully",
//       token,
//       user: {
//         id: newSeller._id,
//         username: newSeller.username,
//         email: newSeller.email,
//         role: newSeller.role,
//         profileComplete: newSeller.profileComplete
//       }
//     });
    
//   } catch (error) {
//     console.error("Signup error:", error);
    
//     // Handle specific MongoDB errors
//     if (error.code === 11000) {
//       // Duplicate key error
//       const field = Object.keys(error.keyPattern)[0];
//       return res.status(400).json({ 
//         message: `${field} already exists` 
//       });
//     }
    
//     // Handle validation errors
//     if (error.name === 'ValidationError') {
//       const messages = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ 
//         message: messages.join(', ') 
//       });
//     }

//     // Generic server error
//     res.status(500).json({ 
//       message: "Server error occurred while creating account",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// exports.updateProfile = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { shopName, logo, theme, bankDetails } = req.body;

//     // Find the seller
//     const seller = await Seller.findById(id);
//     if (!seller) {
//       return res.status(404).json({ 
//         message: "Seller not found" 
//       });
//     }

//     // Update shop name if provided
//     if (shopName) {
//       seller.shopName = shopName.trim();
//     }

//     // Update logo information if provided
//     if (logo) {
//       seller.logo = {
//         type: logo.type || 'generated',
//         url: logo.url,
//         style: logo.style
//       };
//     }

//     // Update theme information if provided
//     if (theme) {
//       seller.theme = {
//         id: theme.id,
//         name: theme.name
//       };
//     }

//     // Update bank details if provided
//     if (bankDetails) {
//       seller.bankDetails = {
//         accountHolder: bankDetails.accountHolder?.trim(),
//         bankName: bankDetails.bankName?.trim(),
//         ifsc: bankDetails.ifsc?.trim().toUpperCase(),
//         accountNumber: bankDetails.accountNumber?.trim(),
//         pan: bankDetails.pan?.trim().toUpperCase(),
//         aadhar: bankDetails.aadhar?.trim()
//       };
//     }

//     // Update profile completion status
//     seller.updateProfileCompletionStatus();

//     await seller.save();

//     res.status(200).json({
//       message: "Profile updated successfully",
//       user: {
//         id: seller._id,
//         username: seller.username,
//         email: seller.email,
//         role: seller.role,
//         shopName: seller.shopName,
//         logo: seller.logo,
//         theme: seller.theme,
//         bankDetails: seller.bankDetails,
//         profileComplete: seller.profileComplete
//       }
//     });

//   } catch (error) {
//     console.error("Update profile error:", error);
    
//     // Handle validation errors
//     if (error.name === 'ValidationError') {
//       const messages = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ 
//         message: messages.join(', ') 
//       });
//     }

//     res.status(500).json({ 
//       message: "Server error occurred while updating profile",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// exports.completeProfile = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     // Destructure only the expected fields to prevent field mapping errors
//     const requestBody = req.body;
//     const shopName = requestBody.shopName;
//     const logo = requestBody.logo;
//     const theme = requestBody.theme;
//     const bankDetails = requestBody.bankDetails;

//     // Log incoming data for debugging (without sensitive info)
//     console.log('Received complete profile request for user:', id);
//     console.log('Request body keys:', Object.keys(requestBody));

//     // Validate required fields
//     if (!shopName || !logo?.url || !theme?.id || !bankDetails) {
//       return res.status(400).json({ 
//         message: "All profile information is required (shopName, logo, theme, bankDetails)" 
//       });
//     }

//     // Validate bank details structure
//     if (typeof bankDetails !== 'object' || Array.isArray(bankDetails)) {
//       return res.status(400).json({ 
//         message: "Bank details must be an object" 
//       });
//     }

//     // Validate bank details fields
//     const requiredBankFields = ['accountHolder', 'bankName', 'ifsc', 'accountNumber', 'pan', 'aadhar'];
//     const missingFields = requiredBankFields.filter(field => 
//       !bankDetails[field] || 
//       !bankDetails[field].toString().trim()
//     );
    
//     if (missingFields.length > 0) {
//       return res.status(400).json({ 
//         message: `Missing required bank details: ${missingFields.join(', ')}` 
//       });
//     }

//     // Find the seller
//     const seller = await Seller.findById(id);
//     if (!seller) {
//       return res.status(404).json({ 
//         message: "Seller not found" 
//       });
//     }

//     // Create a clean update object to avoid field conflicts
//     const updateData = {};
    
//     // Set shopName
//     updateData.shopName = shopName.toString().trim();
    
//     // Set logo object
//     updateData.logo = {
//       type: logo.type || 'generated',
//       url: logo.url.toString().trim(),
//       style: logo.style ? logo.style.toString().trim() : undefined
//     };
    
//     // Set theme object  
//     updateData.theme = {
//       id: parseInt(theme.id),
//       name: theme.name ? theme.name.toString().trim() : undefined
//     };
    
//     // Set bank details object - ensure all fields are strings
//     updateData.bankDetails = {
//       accountHolder: bankDetails.accountHolder.toString().trim(),
//       bankName: bankDetails.bankName.toString().trim(),
//       ifsc: bankDetails.ifsc.toString().trim().toUpperCase(),
//       accountNumber: bankDetails.accountNumber.toString().trim(),
//       pan: bankDetails.pan.toString().trim().toUpperCase(),
//       aadhar: bankDetails.aadhar.toString().trim()
//     };

//     // Use Object.assign to safely update only the specified fields
//     Object.assign(seller, updateData);

//     // Manually set profile completion to true (don't rely on the method)
//     seller.profileComplete = true;

//     // Save the seller
//     await seller.save();

//     console.log('Profile completed successfully for user:', seller._id);

//     // Return clean response
//     res.status(200).json({
//       message: "Profile completed successfully",
//       user: {
//         id: seller._id,
//         username: seller.username,
//         email: seller.email,
//         role: seller.role,
//         shopName: seller.shopName,
//         logo: seller.logo,
//         theme: seller.theme,
//         profileComplete: seller.profileComplete
//       }
//     });

//   } catch (error) {
//     console.error("Complete profile error:", error);
//     console.error("Error stack:", error.stack);
    
//     // Handle validation errors
//     if (error.name === 'ValidationError') {
//       const messages = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ 
//         message: `Validation error: ${messages.join(', ')}` 
//       });
//     }

//     // Handle cast errors with more detail
//     if (error.name === 'CastError') {
//       return res.status(400).json({ 
//         message: `Data type error: Cannot convert "${error.value}" to ${error.kind} for field "${error.path}"` 
//       });
//     }

//     // Handle MongoDB duplicate key errors
//     if (error.code === 11000) {
//       return res.status(400).json({ 
//         message: "Duplicate data found" 
//       });
//     }

//     res.status(500).json({ 
//       message: "Server error occurred while completing profile",
//       error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
//     });
//   }
// };

// exports.getProfile = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     const seller = await Seller.findById(id);
//     if (!seller) {
//       return res.status(404).json({ 
//         message: "Seller not found" 
//       });
//     }

//     res.status(200).json({
//       user: {
//         id: seller._id,
//         username: seller.username,
//         email: seller.email,
//         role: seller.role,
//         shopName: seller.shopName,
//         logo: seller.logo,
//         theme: seller.theme,
//         bankDetails: seller.bankDetails,
//         profileComplete: seller.profileComplete,
//         createdAt: seller.createdAt,
//         updatedAt: seller.updatedAt
//       }
//     });

//   } catch (error) {
//     console.error("Get profile error:", error);
//     res.status(500).json({ 
//       message: "Server error occurred while fetching profile",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// exports.loginSeller = async (req, res) => {
//   try {
//     const { email, password, role } = req.body;
//     const seller = await Seller.findOne({ email });
//     if (!seller || seller.role !== role) {
//       return res.status(401).json({ message: "Invalid credentials or role" });
//     }
    
//     // Use the schema method for password comparison
//     const isMatch = await seller.comparePassword(password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }
    
//     const token = jwt.sign(
//       { id: seller._id, role: seller.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     }).status(200).json({
//       message: "Login successful",
//       token,
//       seller: {
//         id: seller._id,
//         email: seller.email,
//         username: seller.username,
//         role: seller.role,
//         shopName: seller.shopName,
//         profileComplete: seller.profileComplete,
//       },
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ message: "Server error during login" });
//   }
// };

// exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     // 1. Validate email
//     if (!email) {
//       return res.status(400).json({
//         status: 'fail',
//         message: 'Please provide an email address'
//       });
//     }

//     // 2. Check if user exists
//     const seller = await Seller.findOne({ email });
//     if (!seller) {
//       return res.status(404).json({
//         status: 'fail',
//         message: 'No account found with that email address'
//       });
//     }

//     // 3. Generate reset token
//     const resetToken = seller.createPasswordResetToken();
//     await seller.save({ validateBeforeSave: false });

//     // 4. Send email with reset URL
//     const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
//     try {
//       await sendEmail({
//         email: seller.email,
//         subject: 'Your password reset token (valid for 10 min)',
//         message: `Forgot your password? Click this link to reset it: ${resetURL}\nIf you didn't request this, please ignore this email.`
//       });

//       res.status(200).json({
//         status: 'success',
//         message: 'email sent successfully!'
//       });
//     } catch (err) {
//       // Reset the token if email fails
//       seller.passwordResetToken = undefined;
//       seller.passwordResetExpires = undefined;
//       await seller.save({ validateBeforeSave: false });

//       return res.status(500).json({
//         status: 'error',
//         message: 'There was an error sending the email. Try again later!'
//       });
//     }
//   } catch (err) {
//     res.status(500).json({
//       status: 'error',
//       message: err.message
//     });
//   }
// };

// exports.resetPassword = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { password } = req.body;

//     if (!token || !password) {
//       return res.status(400).json({ status: 'fail', message: 'Missing token or password' });
//     }

//     // 1. Hash the token to match the stored one
//     const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

//     // 2. Find seller by hashed token and check if not expired
//     const seller = await Seller.findOne({
//       passwordResetToken: hashedToken,
//       passwordResetExpires: { $gt: Date.now() }
//     });

//     if (!seller) {
//       return res.status(400).json({ status: 'fail', message: 'Token is invalid or has expired' });
//     }

//     // 3. Update password - Let the schema handle hashing
//     seller.password = password;
//     seller.passwordResetToken = undefined;
//     seller.passwordResetExpires = undefined;

//     await seller.save();

//     res.status(200).json({ status: 'success', message: 'Password reset successful!' });
//   } catch (err) {
//     res.status(500).json({ status: 'error', message: err.message });
//   }
// };

// exports.logout = (req, res) => {
//   res.clearCookie("token", {
//     httpOnly: true,
//     sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
//     secure: process.env.NODE_ENV === "production",
//   });
//   res.status(200).json({ message: "Logged out successfully" });
// };


const Seller = require("../models/Seller");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require('../utils/email');
const crypto = require('crypto');

exports.registerSeller = async (req, res) => {
  const { username, email, password, confirmPassword, role } = req.body;

  try {
    // Input validation
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        message: "All fields are required" 
      });
    }

    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        message: "Passwords do not match" 
      });
    }

    // Additional validations - Updated to match frontend requirements
    if (username.length < 3) {
      return res.status(400).json({ 
        message: "Username must be at least 3 characters long" 
      });
    }

    // Changed from 6 to 8 to match schema and frontend validation
    if (password.length < 8) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters long" 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: "Please provide a valid email address" 
      });
    }

    // Check if email exists
    const existingUser = await Seller.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        message: "Email already in use" 
      });
    }

    // Check if username exists
    const existingUsername = await Seller.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ 
        message: "Username already taken" 
      });
    }

    // Create seller - password will be hashed by the pre('save') hook
    const newSeller = new Seller({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      role: role || "seller",
    });

    await newSeller.save();

    // Generate JWT token for the new user
    const token = jwt.sign(
      { id: newSeller._id, role: newSeller.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Return success response with token
    return res.status(201).json({ 
      message: "Account created successfully",
      token,
      user: {
        id: newSeller._id,
        username: newSeller.username,
        email: newSeller.email,
        role: newSeller.role,
        profileComplete: newSeller.profileComplete
      }
    });
    
  } catch (error) {
    console.error("Signup error:", error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field} already exists` 
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: messages.join(', ') 
      });
    }

    // Generic server error
    res.status(500).json({ 
      message: "Server error occurred while creating account",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { shopName, logo, theme, bankDetails } = req.body;

    // Find the seller
    const seller = await Seller.findById(id);
    if (!seller) {
      return res.status(404).json({ 
        message: "Seller not found" 
      });
    }

    // Update shop name if provided
    if (shopName) {
      seller.shopName = shopName.trim();
    }

    // Update logo information if provided
    if (logo) {
      seller.logo = {
        type: logo.type || 'generated',
        url: logo.url,
        style: logo.style
      };
    }

    // Update theme information if provided
    if (theme) {
      seller.theme = {
        id: theme.id,
        name: theme.name
      };
    }

    // Update bank details if provided
    if (bankDetails) {
      // Validate required bank details fields
      const { accountHolder, bankName, ifsc, accountNumber } = bankDetails;
      if (!accountHolder || !bankName || !ifsc || !accountNumber) {
        return res.status(400).json({
          message: "Account holder name, bank name, IFSC code, and account number are required"
        });
      }

      // Validate IFSC format
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(ifsc.toUpperCase())) {
        return res.status(400).json({
          message: "Invalid IFSC code format"
        });
      }

      // Validate PAN format if provided
      if (bankDetails.pan) {
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!panRegex.test(bankDetails.pan.toUpperCase())) {
          return res.status(400).json({
            message: "Invalid PAN number format"
          });
        }
      }

      // Validate Aadhar format if provided
      if (bankDetails.aadhar) {
        const cleanAadhar = bankDetails.aadhar.replace(/\s/g, '');
        if (cleanAadhar.length !== 12 || !/^\d{12}$/.test(cleanAadhar)) {
          return res.status(400).json({
            message: "Invalid Aadhar number format"
          });
        }
      }

      seller.bankDetails = {
        accountHolder: bankDetails.accountHolder?.trim(),
        bankName: bankDetails.bankName?.trim(),
        ifsc: bankDetails.ifsc?.trim().toUpperCase(),
        accountNumber: bankDetails.accountNumber?.trim(),
        pan: bankDetails.pan?.trim().toUpperCase(),
        aadhar: bankDetails.aadhar?.trim()
      };
    }

    // Update profile completion status
    seller.updateProfileCompletionStatus();

    await seller.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: seller._id,
        username: seller.username,
        email: seller.email,
        role: seller.role,
        shopName: seller.shopName,
        logo: seller.logo,
        theme: seller.theme,
        bankDetails: seller.bankDetails,
        profileComplete: seller.profileComplete
      }
    });

  } catch (error) {
    console.error("Update profile error:", error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: messages.join(', ') 
      });
    }

    res.status(500).json({ 
      message: "Server error occurred while updating profile",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.completeProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Destructure only the expected fields to prevent field mapping errors
    const requestBody = req.body;
    const shopName = requestBody.shopName;
    const logo = requestBody.logo;
    const theme = requestBody.theme;
    const bankDetails = requestBody.bankDetails;

    // Log incoming data for debugging (without sensitive info)
    console.log('Received complete profile request for user:', id);
    console.log('Request body keys:', Object.keys(requestBody));

    // Validate required fields
    if (!shopName || !logo?.url || !theme?.id || !bankDetails) {
      return res.status(400).json({ 
        message: "All profile information is required (shopName, logo, theme, bankDetails)" 
      });
    }

    // Validate bank details structure
    if (typeof bankDetails !== 'object' || Array.isArray(bankDetails)) {
      return res.status(400).json({ 
        message: "Bank details must be an object" 
      });
    }

    // Validate bank details fields
    const requiredBankFields = ['accountHolder', 'bankName', 'ifsc', 'accountNumber', 'pan', 'aadhar'];
    const missingFields = requiredBankFields.filter(field => 
      !bankDetails[field] || 
      !bankDetails[field].toString().trim()
    );
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required bank details: ${missingFields.join(', ')}` 
      });
    }

    // Additional validation for bank details
    // Validate IFSC format
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(bankDetails.ifsc.toString().trim().toUpperCase())) {
      return res.status(400).json({
        message: "Invalid IFSC code format"
      });
    }

    // Validate PAN format
    if (bankDetails.pan) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(bankDetails.pan.toString().trim().toUpperCase())) {
        return res.status(400).json({
          message: "Invalid PAN number format"
        });
      }
    }

    // Validate Aadhar format
    if (bankDetails.aadhar) {
      const cleanAadhar = bankDetails.aadhar.toString().trim().replace(/\s/g, '');
      if (cleanAadhar.length !== 12 || !/^\d{12}$/.test(cleanAadhar)) {
        return res.status(400).json({
          message: "Invalid Aadhar number format"
        });
      }
    }

    // Find the seller
    const seller = await Seller.findById(id);
    if (!seller) {
      return res.status(404).json({ 
        message: "Seller not found" 
      });
    }

    // Create a clean update object to avoid field conflicts
    const updateData = {};
    
    // Set shopName
    updateData.shopName = shopName.toString().trim();
    
    // Set logo object
    updateData.logo = {
      type: logo.type || 'generated',
      url: logo.url.toString().trim(),
      style: logo.style ? logo.style.toString().trim() : undefined
    };
    
    // Set theme object  
    updateData.theme = {
      id: parseInt(theme.id),
      name: theme.name ? theme.name.toString().trim() : undefined
    };
    
    // Set bank details object - ensure all fields are strings
    updateData.bankDetails = {
      accountHolder: bankDetails.accountHolder.toString().trim(),
      bankName: bankDetails.bankName.toString().trim(),
      ifsc: bankDetails.ifsc.toString().trim().toUpperCase(),
      accountNumber: bankDetails.accountNumber.toString().trim(),
      pan: bankDetails.pan.toString().trim().toUpperCase(),
      aadhar: bankDetails.aadhar.toString().trim()
    };

    // Use Object.assign to safely update only the specified fields
    Object.assign(seller, updateData);

    // Manually set profile completion to true (don't rely on the method)
    seller.profileComplete = true;

    // Save the seller
    await seller.save();

    console.log('Profile completed successfully for user:', seller._id);

    // Return clean response
    res.status(200).json({
      message: "Profile completed successfully",
      user: {
        id: seller._id,
        username: seller.username,
        email: seller.email,
        role: seller.role,
        shopName: seller.shopName,
        logo: seller.logo,
        theme: seller.theme,
        profileComplete: seller.profileComplete
      }
    });

  } catch (error) {
    console.error("Complete profile error:", error);
    console.error("Error stack:", error.stack);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: `Validation error: ${messages.join(', ')}` 
      });
    }

    // Handle cast errors with more detail
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: `Data type error: Cannot convert "${error.value}" to ${error.kind} for field "${error.path}"` 
      });
    }

    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "Duplicate data found" 
      });
    }

    res.status(500).json({ 
      message: "Server error occurred while completing profile",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const seller = await Seller.findById(id);
    if (!seller) {
      return res.status(404).json({ 
        message: "Seller not found" 
      });
    }

    // Return full bank details for the profile owner (unmasked)
    const sellerData = seller.toObject();
    delete sellerData.password;
    delete sellerData.passwordResetToken;
    delete sellerData.passwordResetExpires;

    res.status(200).json({
      user: {
        id: sellerData._id,
        username: sellerData.username,
        email: sellerData.email,
        role: sellerData.role,
        shopName: sellerData.shopName,
        logo: sellerData.logo,
        theme: sellerData.theme,
        bankDetails: sellerData.bankDetails, // Full unmasked data for owner
        profileComplete: sellerData.profileComplete,
        createdAt: sellerData.createdAt,
        updatedAt: sellerData.updatedAt
      }
    });

  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ 
      message: "Server error occurred while fetching profile",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.loginSeller = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const seller = await Seller.findOne({ email });
    if (!seller || seller.role !== role) {
      return res.status(401).json({ message: "Invalid credentials or role" });
    }
    
    // Use the schema method for password comparison
    const isMatch = await seller.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const token = jwt.sign(
      { id: seller._id, role: seller.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }).status(200).json({
      message: "Login successful",
      token,
      seller: {
        id: seller._id,
        email: seller.email,
        username: seller.username,
        role: seller.role,
        shopName: seller.shopName,
        profileComplete: seller.profileComplete,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Validate email
    if (!email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide an email address'
      });
    }

    // 2. Check if user exists
    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res.status(404).json({
        status: 'fail',
        message: 'No account found with that email address'
      });
    }

    // 3. Generate reset token
    const resetToken = seller.createPasswordResetToken();
    await seller.save({ validateBeforeSave: false });

    // 4. Send email with reset URL
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    try {
      await sendEmail({
        email: seller.email,
        subject: 'Your password reset token (valid for 10 min)',
        message: `Forgot your password? Click this link to reset it: ${resetURL}\nIf you didn't request this, please ignore this email.`
      });

      res.status(200).json({
        status: 'success',
        message: 'email sent successfully!'
      });
    } catch (err) {
      // Reset the token if email fails
      seller.passwordResetToken = undefined;
      seller.passwordResetExpires = undefined;
      await seller.save({ validateBeforeSave: false });

      return res.status(500).json({
        status: 'error',
        message: 'There was an error sending the email. Try again later!'
      });
    }
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ status: 'fail', message: 'Missing token or password' });
    }

    // 1. Hash the token to match the stored one
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 2. Find seller by hashed token and check if not expired
    const seller = await Seller.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!seller) {
      return res.status(400).json({ status: 'fail', message: 'Token is invalid or has expired' });
    }

    // 3. Update password - Let the schema handle hashing
    seller.password = password;
    seller.passwordResetToken = undefined;
    seller.passwordResetExpires = undefined;

    await seller.save();

    res.status(200).json({ status: 'success', message: 'Password reset successful!' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ message: "Logged out successfully" });
};